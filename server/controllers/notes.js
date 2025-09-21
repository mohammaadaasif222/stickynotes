const Note = require('../models/Note');
const NoteHistory = require('../models/NoteHistory');
const mongoose = require('mongoose');

class NotesController {
  // Get all accessible notes for the user
  async getNotes(req, res) {
    try {
      const userId = req.user.id;
      const { search, sortBy, sortOrder, limit, skip } = req.query;

      const options = {
        search,
        sortBy,
        sortOrder,
        limit: limit ? parseInt(limit) : 20,
        skip: skip ? parseInt(skip) : 0
      };

      const notes = await Note.findAccessibleNotes(userId, options);
      
      res.json({
        success: true,
        data: notes,
        count: notes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching notes',
        error: error.message
      });
    }
  }

  // Get a specific note by ID
  async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false })
        .populate('owner', 'username firstName lastName avatar')
        .populate('collaborators.user', 'username firstName lastName avatar')
        .populate('lastEditedBy', 'username firstName lastName avatar');

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check permissions
      if (!note.hasPermission(userId, 'read-only')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching note',
        error: error.message
      });
    }
  }

  // Create a new note
  async createNote(req, res) {
    try {
      const { title, content, tags, isPublic } = req.body;
      const userId = req.user.id;

      // Validation
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const newNote = new Note({
        title: title.trim(),
        content,
        owner: userId,
        lastEditedBy: userId,
        tags: tags || [],
        isPublic: isPublic || false
      });

      await newNote.save();

      // Populate the created note
      await newNote.populate('owner', 'username firstName lastName avatar');
      await newNote.populate('lastEditedBy', 'username firstName lastName avatar');

      // Create history entry
      await NoteHistory.createEntry({
        noteId: newNote._id,
        userId,
        action: 'created',
        snapshot: {
          title: newNote.title,
          content: newNote.content,
          version: newNote.version
        },
        changeType: 'major',
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      });

      // Real-time broadcasting for public notes
      const socketManager = req.app.get('socketManager');
      if (socketManager && newNote.isPublic) {
        socketManager.broadcastNoteCreated(newNote, {
          id: req.user.id,
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          avatar: req.user.avatar
        });
      }

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: newNote
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating note',
        error: error.message
      });
    }
  }

  // Update a note
  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { title, content, tags, isPublic } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check permissions
      if (!note.hasPermission(userId, 'editor')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this note'
        });
      }

      // Store old values for history and broadcasting
      const oldTitle = note.title;
      const oldContent = note.content;
      const oldIsPublic = note.isPublic;

      // Update fields
      if (title !== undefined) note.title = title.trim();
      if (content !== undefined) note.content = content;
      if (tags !== undefined) note.tags = tags;
      if (isPublic !== undefined && note.owner.toString() === userId.toString()) {
        note.isPublic = isPublic;
      }

      note.lastEditedBy = userId;

      await note.save();

      // Populate the updated note
      await note.populate('owner', 'username firstName lastName avatar');
      await note.populate('collaborators.user', 'username firstName lastName avatar');
      await note.populate('lastEditedBy', 'username firstName lastName avatar');

      // Create history entry
      const changes = {};
      if (title !== undefined && title !== oldTitle) {
        changes.title = { old: oldTitle, new: title };
      }
      if (content !== undefined && content !== oldContent) {
        changes.content = { old: oldContent, new: content };
      }
      if (isPublic !== undefined && isPublic !== oldIsPublic && note.owner.toString() === userId.toString()) {
        changes.isPublic = { old: oldIsPublic, new: isPublic };
      }

      if (Object.keys(changes).length > 0) {
        await NoteHistory.createEntry({
          noteId: note._id,
          userId,
          action: 'updated',
          changes,
          snapshot: {
            title: note.title,
            content: note.content,
            version: note.version
          },
          changeType: 'major',
          metadata: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
          }
        });
      }

      // Emit real-time update to note room
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToNoteRoom(`note-${id}`, 'note-updated', {
          noteId: id,
          note: note,
          updatedBy: {
            id: userId,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName
          },
          changes
        });

        // Broadcast to global room if it's public or became public
        if (note.isPublic || changes.isPublic) {
          socketManager.broadcastNoteUpdated(note, {
            id: req.user.id,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            avatar: req.user.avatar
          }, changes);
        }
      }

      res.json({
        success: true,
        message: 'Note updated successfully',
        data: note
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating note',
        error: error.message
      });
    }
  }

  // Delete a note (soft delete)
  async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Only owner can delete
      if (note.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the owner can delete this note'
        });
      }

      note.isDeleted = true;
      note.lastEditedBy = userId;
      await note.save();

      // Create history entry
      await NoteHistory.createEntry({
        noteId: note._id,
        userId,
        action: 'deleted',
        snapshot: {
          title: note.title,
          content: note.content,
          version: note.version
        },
        changeType: 'major',
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      });

      // Emit real-time deletion
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToNoteRoom(`note-${id}`, 'note-deleted', {
          noteId: id,
          deletedBy: {
            id: userId,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName
          }
        });

        // Broadcast to global room if it was public
        if (note.isPublic) {
          socketManager.broadcastNoteDeleted(note, {
            id: req.user.id,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            avatar: req.user.avatar
          });
        }
      }

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting note',
        error: error.message
      });
    }
  }

  // Add collaborator to a note
  async addCollaborator(req, res) {
    try {
      const { id } = req.params;
      const { userId: collaboratorId, role } = req.body;
      const ownerId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(collaboratorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Only owner can add collaborators
      if (note.owner.toString() !== ownerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the owner can add collaborators'
        });
      }

      await note.addCollaborator(collaboratorId, role);
      await note.populate('collaborators.user', 'username firstName lastName avatar');

      // Emit real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToNoteRoom(`note-${id}`, 'collaborator-added', {
          noteId: id,
          collaborator: note.collaborators.find(c => c.user._id.toString() === collaboratorId.toString()),
          addedBy: {
            id: ownerId,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName
          }
        });
      }

      res.json({
        success: true,
        message: 'Collaborator added successfully',
        data: note.collaborators
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding collaborator',
        error: error.message
      });
    }
  }

  // Remove collaborator from a note
  async removeCollaborator(req, res) {
    try {
      const { id } = req.params;
      const { userId: collaboratorId } = req.body;
      const ownerId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(collaboratorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Only owner can remove collaborators
      if (note.owner.toString() !== ownerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the owner can remove collaborators'
        });
      }

      await note.removeCollaborator(collaboratorId);

      // Emit real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.emitToNoteRoom(`note-${id}`, 'collaborator-removed', {
          noteId: id,
          removedCollaboratorId: collaboratorId,
          removedBy: {
            id: ownerId,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName
          }
        });
      }

      res.json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing collaborator',
        error: error.message
      });
    }
  }

  // Get note history
  async getNoteHistory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { limit } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check permissions
      if (!note.hasPermission(userId, 'read-only')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const history = await NoteHistory.getNoteHistory(id, parseInt(limit) || 10);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching note history',
        error: error.message
      });
    }
  }

  // Real-time content update (for live typing)
  async updateContent(req, res) {
    try {
      const { id } = req.params;
      const { content, isAutoSave } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID'
        });
      }

      const note = await Note.findOne({ _id: id, isDeleted: false });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check permissions
      if (!note.hasPermission(userId, 'editor')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this note'
        });
      }

      const oldContent = note.content;
      note.content = content;
      note.lastEditedBy = userId;

      await note.save();

      // Create history entry for auto-save
      if (isAutoSave && oldContent !== content) {
        await NoteHistory.createEntry({
          noteId: note._id,
          userId,
          action: 'updated',
          changes: {
            content: { old: oldContent, new: content }
          },
          changeType: 'auto-save',
          metadata: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
          }
        });
      }

      res.json({
        success: true,
        message: 'Content updated successfully',
        version: note.version
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating content',
        error: error.message
      });
    }
  }

  // Get all public notes (for discovery)
  async getPublicNotes(req, res) {
    try {
      const { search, sortBy, sortOrder, limit, skip, tags } = req.query;

      const query = { isPublic: true, isDeleted: false };
      
      // Add search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      // Add tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      let notesQuery = Note.find(query)
        .populate('owner', 'username firstName lastName avatar')
        .populate('lastEditedBy', 'username firstName lastName avatar');

      // Sorting
      const sortField = sortBy || 'updatedAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      notesQuery = notesQuery.sort({ [sortField]: sortDirection });

      // Pagination
      const limitNum = parseInt(limit) || 20;
      const skipNum = parseInt(skip) || 0;
      notesQuery = notesQuery.limit(limitNum).skip(skipNum);

      const notes = await notesQuery.exec();
      
      res.json({
        success: true,
        data: notes,
        count: notes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching public notes',
        error: error.message
      });
    }
  }

  // Search notes (including public ones)
  async searchNotes(req, res) {
    try {
      const userId = req.user.id;
      const { q, includePublic, tags, sortBy, sortOrder, limit, skip } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const searchRegex = { $regex: q.trim(), $options: 'i' };
      
      let baseQuery = {
        isDeleted: false,
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      };

      // Build permission query
      let permissionQuery = {
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      };

      // Include public notes if requested
      if (includePublic === 'true') {
        permissionQuery.$or.push({ isPublic: true });
      }

      const finalQuery = {
        ...baseQuery,
        ...permissionQuery
      };

      // Add tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        finalQuery.tags = { $in: tagArray };
      }

      let notesQuery = Note.find(finalQuery)
        .populate('owner', 'username firstName lastName avatar')
        .populate('lastEditedBy', 'username firstName lastName avatar');

      // Sorting
      const sortField = sortBy || 'updatedAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      notesQuery = notesQuery.sort({ [sortField]: sortDirection });

      // Pagination
      const limitNum = parseInt(limit) || 20;
      const skipNum = parseInt(skip) || 0;
      notesQuery = notesQuery.limit(limitNum).skip(skipNum);

      const notes = await notesQuery.exec();

      res.json({
        success: true,
        data: notes,
        count: notes.length,
        query: q
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching notes',
        error: error.message
      });
    }
  }

  // Get statistics about notes
  async getNoteStats(req, res) {
    try {
      const userId = req.user.id;

      const [
        ownedNotes,
        collaboratedNotes,
        publicNotes,
        totalNotes
      ] = await Promise.all([
        Note.countDocuments({ owner: userId, isDeleted: false }),
        Note.countDocuments({ 'collaborators.user': userId, isDeleted: false }),
        Note.countDocuments({ isPublic: true, isDeleted: false }),
        Note.countDocuments({ isDeleted: false })
      ]);

      res.json({
        success: true,
        data: {
          owned: ownedNotes,
          collaborated: collaboratedNotes,
          public: publicNotes,
          total: totalNotes
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching note statistics',
        error: error.message
      });
    }
  }
}

module.exports = new NotesController();