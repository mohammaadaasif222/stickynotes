// // backend/socketManager.js
// const socketIo = require('socket.io');
// const jwt = require('jsonwebtoken');
// const Note = require('../models/Note');
// const NoteHistory = require('../models/NoteHistory');
// const User = require('../models/User');

// class SocketManager {
  
//   constructor(server) {
//     this.io = socketIo(server, {
//       cors: {
//         origin: ["http://localhost:3000", "http://localhost:3001"],
//         methods: ["GET", "POST"],
//         credentials: true,
//         allowedHeaders: ["Authorization"]
//       },
//       pingTimeout: 60000,
//       pingInterval: 25000,
//       transports: ['websocket', 'polling'],
//       allowEIO3: true
//     });

//     this.activeUsers = new Map();
//     this.userSockets = new Map();
//     this.socketUsers = new Map();
//     this.saveTimeouts = {};
    
//     this.setupEventHandlers();
//   }

//   setupEventHandlers() {
//     this.io.use(this.authenticateSocket.bind(this));
//     this.io.on('connection', this.handleConnection.bind(this));
//   }

//   async authenticateSocket(socket, next) {
//     try {
            
//       let token = socket.handshake.auth.token || 
//                   socket.handshake.headers.authorization ||
//                   socket.request.headers.authorization;
      
//       if (!token) {
//         console.log('No token provided in socket authentication');
//         return next(new Error('Authentication error: No token provided'));
//       }

//       if (token.startsWith('Bearer ')) {
//         token = token.substring(7);
//       }

    
      
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       const user = await User.findById(decoded.userId);
//       if (!user) {
//         return next(new Error('Authentication error: User not found'));
//       }

//       if (!user.isActive) {
//         return next(new Error('Authentication error: User account is inactive'));
//       }

//       socket.userId = user._id.toString();
//       socket.user = {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         avatar: user.avatar,
//         username: user.username
//       };

//       next();
//     } catch (error) {
//       console.error('Socket authentication error:', error.message);
//       if (error.name === 'JsonWebTokenError') {
//         next(new Error('Authentication error: Invalid token'));
//       } else if (error.name === 'TokenExpiredError') {
//         next(new Error('Authentication error: Token expired'));
//       } else {
//         next(new Error('Authentication error: ' + error.message));
//       }
//     }
//   }

//   handleConnection(socket) {
//     console.log(`User ${socket.userId} connected with socket ${socket.id}`);
    
//     this.userSockets.set(socket.userId, socket.id);
//     this.socketUsers.set(socket.id, socket.userId);

//     // Set up event listeners
//     socket.on('join-note', (data) => this.handleJoinNote(socket, data));
//     socket.on('leave-note', (data) => this.handleLeaveNote(socket, data));
//     socket.on('typing-start', (data) => this.handleTypingStart(socket, data));
//     socket.on('typing-stop', (data) => this.handleTypingStop(socket, data));
//     socket.on('cursor-position', (data) => this.handleCursorPosition(socket, data));
//     socket.on('content-change', (data) => this.handleContentChange(socket, data));
//     socket.on('request-sync', (data) => this.handleRequestSync(socket, data));
//     socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason));
    
//     socket.on('error', (error) => {
//       console.error('Socket error for user', socket.userId, ':', error);
//     });

//     // Send immediate connection confirmation
//     socket.emit('connected', {
//       message: 'Connected successfully',
//       userId: socket.userId,
//       timestamp: Date.now()
//     });

//     console.log(`Total connected users: ${this.socketUsers.size}`);
//   }

//   async handleJoinNote(socket, data) {
//     try {
//       console.log(`User ${socket.userId} attempting to join note:`, data);
      
//       const { noteId } = data;
      
//       if (!noteId) {
//         console.log('No noteId provided');
//         socket.emit('error', { message: 'Note ID is required' });
//         return;
//       }

//       // Basic validation for MongoDB ObjectId format
//       if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
//         console.log('Invalid noteId format:', noteId);
//         socket.emit('error', { message: 'Invalid note ID format' });
//         return;
//       }

//       // Find the note
//       const note = await Note.findOne({ _id: noteId, isDeleted: false })
//         .populate('owner', 'username firstName lastName avatar')
//         .populate('collaborators.user', 'username firstName lastName avatar');

//       if (!note) {
//         console.log('Note not found:', noteId);
//         socket.emit('error', { message: 'Note not found' });
//         return;
//       }

//       // Simple permission check - you may need to adjust this based on your Note model
//       const isOwner = note.owner._id.toString() === socket.userId;
//       const isCollaborator = note.collaborators && note.collaborators.some(
//         collab => collab.user._id.toString() === socket.userId
//       );
//       const isPublic = note.isPublic;

//       if (!isOwner && !isCollaborator && !isPublic) {
//         console.log('Access denied for user:', socket.userId);
//         socket.emit('error', { message: 'Access denied' });
//         return;
//       }

//       // Join the note room
//       socket.join(`note-${noteId}`);
//       socket.currentNoteId = noteId;

//       // Track active users
//       if (!this.activeUsers.has(noteId)) {
//         this.activeUsers.set(noteId, new Set());
//       }
//       this.activeUsers.get(noteId).add(socket.userId);

//       // Get active users details
//       const activeUsersList = Array.from(this.activeUsers.get(noteId));
//       const activeUsersDetails = await User.find(
//         { _id: { $in: activeUsersList } },
//         'username firstName lastName avatar'
//       );

//       // Determine if user can edit
//       const canEdit = isOwner || (isCollaborator && note.collaborators.find(
//         collab => collab.user._id.toString() === socket.userId
//       )?.permission !== 'read-only');

//       // Send success response
//       socket.emit('note-joined', {
//         noteId,
//         note: {
//           _id: note._id,
//           title: note.title,
//           content: note.content,
//           owner: note.owner,
//           collaborators: note.collaborators,
//           isPublic: note.isPublic,
//           tags: note.tags,
//           updatedAt: note.updatedAt
//         },
//         activeUsers: activeUsersDetails,
//         canEdit
//       });

//       // Notify other users
//       socket.to(`note-${noteId}`).emit('user-joined', {
//         user: socket.user,
//         noteId
//       });

//       console.log(`User ${socket.userId} successfully joined note ${noteId}`);
//     } catch (error) {
//       console.error('Error in handleJoinNote:', error);
//       socket.emit('error', { 
//         message: 'Failed to join note',
//         details: error.message 
//       });
//     }
//   }

//   async handleLeaveNote(socket, data) {
//     try {
//       const { noteId } = data;
      
//       if (!noteId || socket.currentNoteId !== noteId) {
//         return;
//       }

//       socket.leave(`note-${noteId}`);
      
//       if (this.activeUsers.has(noteId)) {
//         this.activeUsers.get(noteId).delete(socket.userId);
        
//         if (this.activeUsers.get(noteId).size === 0) {
//           this.activeUsers.delete(noteId);
//         }
//       }

//       socket.currentNoteId = null;

//       socket.to(`note-${noteId}`).emit('user-left', {
//         userId: socket.userId,
//         noteId
//       });

//       socket.emit('note-left', { noteId });
//       console.log(`User ${socket.userId} left note ${noteId}`);
//     } catch (error) {
//       console.error('Error in handleLeaveNote:', error);
//     }
//   }

//   async handleTypingStart(socket, data) {
//     try {
//       const { noteId, cursorPosition } = data;
      
//       if (!noteId || socket.currentNoteId !== noteId) {
//         return;
//       }

//       socket.to(`note-${noteId}`).emit('user-typing-start', {
//         userId: socket.userId,
//         user: socket.user,
//         noteId,
//         cursorPosition
//       });
//     } catch (error) {
//       console.error('Error in handleTypingStart:', error);
//     }
//   }

//   async handleTypingStop(socket, data) {
//     try {
//       const { noteId } = data;
      
//       if (!noteId || socket.currentNoteId !== noteId) {
//         return;
//       }

//       socket.to(`note-${noteId}`).emit('user-typing-stop', {
//         userId: socket.userId,
//         noteId
//       });
//     } catch (error) {
//       console.error('Error in handleTypingStop:', error);
//     }
//   }

//   async handleCursorPosition(socket, data) {
//     try {
//       const { noteId, position, selection } = data;
      
//       if (!noteId || socket.currentNoteId !== noteId) {
//         return;
//       }

//       socket.to(`note-${noteId}`).emit('user-cursor-position', {
//         userId: socket.userId,
//         user: socket.user,
//         noteId,
//         position,
//         selection
//       });
//     } catch (error) {
//       console.error('Error in handleCursorPosition:', error);
//     }
//   }

//   async handleContentChange(socket, data) {
//     try {
//       const { noteId, content, operation, position, length, timestamp } = data;
      
//       if (!noteId || socket.currentNoteId !== noteId) {
//         socket.emit('error', { message: 'Not connected to this note' });
//         return;
//       }

//       const note = await Note.findOne({ _id: noteId, isDeleted: false });
//       if (!note) {
//         socket.emit('error', { message: 'Note not found' });
//         return;
//       }

//       const changeData = {
//         userId: socket.userId,
//         user: socket.user,
//         noteId,
//         operation,
//         content,
//         position,
//         length,
//         timestamp: timestamp || Date.now(),
//         version: note.version || 1
//       };

//       socket.to(`note-${noteId}`).emit('content-changed', changeData);
//       this.debouncedSave(noteId, content, socket.userId);

//       console.log(`Content change processed for note ${noteId} by user ${socket.userId}`);
//     } catch (error) {
//       console.error('Error in handleContentChange:', error);
//       socket.emit('error', { message: 'Failed to process content change' });
//     }
//   }

//   async handleRequestSync(socket, data) {
//     try {
//       const { noteId, clientVersion } = data;
      
//       if (!noteId) {
//         socket.emit('error', { message: 'Note ID is required' });
//         return;
//       }

//       const note = await Note.findOne({ _id: noteId, isDeleted: false })
//         .populate('owner', 'username firstName lastName avatar')
//         .populate('lastEditedBy', 'username firstName lastName avatar');

//       if (!note) {
//         socket.emit('error', { message: 'Note not found' });
//         return;
//       }

//       socket.emit('sync-response', {
//         noteId,
//         content: note.content,
//         version: note.version || 1,
//         lastEditedBy: note.lastEditedBy,
//         updatedAt: note.updatedAt,
//         needsSync: !clientVersion || clientVersion !== (note.version || 1)
//       });

//       console.log(`Sync response sent for note ${noteId}`);
//     } catch (error) {
//       console.error('Error in handleRequestSync:', error);
//       socket.emit('error', { message: 'Failed to sync note' });
//     }
//   }

//   handleDisconnect(socket, reason) {
//     console.log(`User ${socket.userId} disconnected: ${reason}`);
    
//     try {
//       if (socket.currentNoteId) {
//         const noteId = socket.currentNoteId;
        
//         if (this.activeUsers.has(noteId)) {
//           this.activeUsers.get(noteId).delete(socket.userId);
          
//           if (this.activeUsers.get(noteId).size === 0) {
//             this.activeUsers.delete(noteId);
//           }
//         }

//         socket.to(`note-${noteId}`).emit('user-left', {
//           userId: socket.userId,
//           noteId
//         });
//       }

//       this.userSockets.delete(socket.userId);
//       this.socketUsers.delete(socket.id);
      
//       console.log(`Total connected users: ${this.socketUsers.size}`);
//     } catch (error) {
//       console.error('Error in handleDisconnect:', error);
//     }
//   }

//   debouncedSave(noteId, content, userId) {
//     if (this.saveTimeouts[noteId]) {
//       clearTimeout(this.saveTimeouts[noteId]);
//     }

//     this.saveTimeouts[noteId] = setTimeout(async () => {
//       try {
//         const note = await Note.findOne({ _id: noteId, isDeleted: false });
//         if (!note) {
//           console.log('Note not found for auto-save:', noteId);
//           return;
//         }

//         const oldContent = note.content;
        
//         if (oldContent === content) {
//           console.log('Content unchanged, skipping save for note:', noteId);
//           return;
//         }

//         note.content = content;
//         note.lastEditedBy = userId;
//         note.version = (note.version || 1) + 1;
//         await note.save();

//         this.io.to(`note-${noteId}`).emit('auto-saved', {
//           noteId,
//           version: note.version,
//           timestamp: Date.now()
//         });

//         console.log(`Auto-saved note ${noteId}, new version: ${note.version}`);
//       } catch (error) {
//         console.error('Auto-save error for note', noteId, ':', error);
//         this.io.to(`note-${noteId}`).emit('save-error', {
//           noteId,
//           error: 'Failed to auto-save changes',
//           details: error.message
//         });
//       }
//     }, 2000);
//   }

//   getActiveUsers(noteId) {
//     return this.activeUsers.get(noteId) || new Set();
//   }

//   emitToUser(userId, event, data) {
//     const socketId = this.userSockets.get(userId);
//     if (socketId) {
//       this.io.to(socketId).emit(event, data);
//       return true;
//     }
//     return false;
//   }

//   emitToNoteRoom(noteId, event, data) {
//     this.io.to(`note-${noteId}`).emit(event, data);
//   }

//   disconnectUser(userId, reason = 'Server disconnect') {
//     const socketId = this.userSockets.get(userId);
//     if (socketId) {
//       const socket = this.io.sockets.sockets.get(socketId);
//       if (socket) {
//         socket.emit('force-disconnect', { reason });
//         socket.disconnect(true);
//         return true;
//       }
//     }
//     return false;
//   }

//   getConnectionStats() {
//     return {
//       totalConnections: this.socketUsers.size,
//       activeNotes: this.activeUsers.size,
//       totalActiveUsers: Array.from(this.activeUsers.values()).reduce((sum, users) => sum + users.size, 0)
//     };
//   }

//   cleanup() {
//     console.log('Cleaning up SocketManager...');
//     if (this.saveTimeouts) {
//       Object.values(this.saveTimeouts).forEach(timeout => {
//         clearTimeout(timeout);
//       });
//       this.saveTimeouts = {};
//     }
//     this.activeUsers.clear();
//     this.userSockets.clear();
//     this.socketUsers.clear();
//   }
// }

// module.exports = SocketManager;




// backend/socketManager.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');
const NoteHistory = require('../models/NoteHistory');
const User = require('../models/User');

class SocketManager {
  
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization"]
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    this.activeUsers = new Map();
    this.userSockets = new Map();
    this.socketUsers = new Map();
    this.saveTimeouts = {};
    
    // Global room for all authenticated users
    this.GLOBAL_ROOM = 'global-updates';
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }

  async authenticateSocket(socket, next) {
    try {
            
      let token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization ||
                  socket.request.headers.authorization;
      
      if (!token) {
        console.log('No token provided in socket authentication');
        return next(new Error('Authentication error: No token provided'));
      }

      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

    
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: User account is inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        username: user.username
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        next(new Error('Authentication error: Invalid token'));
      } else if (error.name === 'TokenExpiredError') {
        next(new Error('Authentication error: Token expired'));
      } else {
        next(new Error('Authentication error: ' + error.message));
      }
    }
  }

  handleConnection(socket) {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`);
    
    this.userSockets.set(socket.userId, socket.id);
    this.socketUsers.set(socket.id, socket.userId);

    // Join global room for public note notifications
    socket.join(this.GLOBAL_ROOM);

    // Set up event listeners
    socket.on('join-note', (data) => this.handleJoinNote(socket, data));
    socket.on('leave-note', (data) => this.handleLeaveNote(socket, data));
    socket.on('typing-start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing-stop', (data) => this.handleTypingStop(socket, data));
    socket.on('cursor-position', (data) => this.handleCursorPosition(socket, data));
    socket.on('content-change', (data) => this.handleContentChange(socket, data));
    socket.on('request-sync', (data) => this.handleRequestSync(socket, data));
    socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason));
    
    // Add new event handlers for global updates
    socket.on('join-global-updates', () => this.handleJoinGlobalUpdates(socket));
    socket.on('leave-global-updates', () => this.handleLeaveGlobalUpdates(socket));
    
    socket.on('error', (error) => {
      console.error('Socket error for user', socket.userId, ':', error);
    });

    // Send immediate connection confirmation
    socket.emit('connected', {
      message: 'Connected successfully',
      userId: socket.userId,
      timestamp: Date.now()
    });

    console.log(`Total connected users: ${this.socketUsers.size}`);
  }

  handleJoinGlobalUpdates(socket) {
    socket.join(this.GLOBAL_ROOM);
    console.log(`User ${socket.userId} joined global updates room`);
    socket.emit('global-updates-joined', { 
      message: 'Successfully joined global updates',
      timestamp: Date.now()
    });
  }

  handleLeaveGlobalUpdates(socket) {
    socket.leave(this.GLOBAL_ROOM);
    console.log(`User ${socket.userId} left global updates room`);
    socket.emit('global-updates-left', { 
      message: 'Left global updates',
      timestamp: Date.now()
    });
  }

  async handleJoinNote(socket, data) {
    try {
      console.log(`User ${socket.userId} attempting to join note:`, data);
      
      const { noteId } = data;
      
      if (!noteId) {
        console.log('No noteId provided');
        socket.emit('error', { message: 'Note ID is required' });
        return;
      }

      // Basic validation for MongoDB ObjectId format
      if (!noteId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid noteId format:', noteId);
        socket.emit('error', { message: 'Invalid note ID format' });
        return;
      }

      // Find the note
      const note = await Note.findOne({ _id: noteId, isDeleted: false })
        .populate('owner', 'username firstName lastName avatar')
        .populate('collaborators.user', 'username firstName lastName avatar');

      if (!note) {
        console.log('Note not found:', noteId);
        socket.emit('error', { message: 'Note not found' });
        return;
      }

      // Simple permission check - you may need to adjust this based on your Note model
      const isOwner = note.owner._id.toString() === socket.userId;
      const isCollaborator = note.collaborators && note.collaborators.some(
        collab => collab.user._id.toString() === socket.userId
      );
      const isPublic = note.isPublic;

      if (!isOwner && !isCollaborator && !isPublic) {
        console.log('Access denied for user:', socket.userId);
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Join the note room
      socket.join(`note-${noteId}`);
      socket.currentNoteId = noteId;

      // Track active users
      if (!this.activeUsers.has(noteId)) {
        this.activeUsers.set(noteId, new Set());
      }
      this.activeUsers.get(noteId).add(socket.userId);

      // Get active users details
      const activeUsersList = Array.from(this.activeUsers.get(noteId));
      const activeUsersDetails = await User.find(
        { _id: { $in: activeUsersList } },
        'username firstName lastName avatar'
      );

      // Determine if user can edit
      const canEdit = isOwner || (isCollaborator && note.collaborators.find(
        collab => collab.user._id.toString() === socket.userId
      )?.permission !== 'read-only');

      // Send success response
      socket.emit('note-joined', {
        noteId,
        note: {
          _id: note._id,
          title: note.title,
          content: note.content,
          owner: note.owner,
          collaborators: note.collaborators,
          isPublic: note.isPublic,
          tags: note.tags,
          updatedAt: note.updatedAt
        },
        activeUsers: activeUsersDetails,
        canEdit
      });

      // Notify other users
      socket.to(`note-${noteId}`).emit('user-joined', {
        user: socket.user,
        noteId
      });

      console.log(`User ${socket.userId} successfully joined note ${noteId}`);
    } catch (error) {
      console.error('Error in handleJoinNote:', error);
      socket.emit('error', { 
        message: 'Failed to join note',
        details: error.message 
      });
    }
  }

  async handleLeaveNote(socket, data) {
    try {
      const { noteId } = data;
      
      if (!noteId || socket.currentNoteId !== noteId) {
        return;
      }

      socket.leave(`note-${noteId}`);
      
      if (this.activeUsers.has(noteId)) {
        this.activeUsers.get(noteId).delete(socket.userId);
        
        if (this.activeUsers.get(noteId).size === 0) {
          this.activeUsers.delete(noteId);
        }
      }

      socket.currentNoteId = null;

      socket.to(`note-${noteId}`).emit('user-left', {
        userId: socket.userId,
        noteId
      });

      socket.emit('note-left', { noteId });
      console.log(`User ${socket.userId} left note ${noteId}`);
    } catch (error) {
      console.error('Error in handleLeaveNote:', error);
    }
  }

  async handleTypingStart(socket, data) {
    try {
      const { noteId, cursorPosition } = data;
      
      if (!noteId || socket.currentNoteId !== noteId) {
        return;
      }

      socket.to(`note-${noteId}`).emit('user-typing-start', {
        userId: socket.userId,
        user: socket.user,
        noteId,
        cursorPosition
      });
    } catch (error) {
      console.error('Error in handleTypingStart:', error);
    }
  }

  async handleTypingStop(socket, data) {
    try {
      const { noteId } = data;
      
      if (!noteId || socket.currentNoteId !== noteId) {
        return;
      }

      socket.to(`note-${noteId}`).emit('user-typing-stop', {
        userId: socket.userId,
        noteId
      });
    } catch (error) {
      console.error('Error in handleTypingStop:', error);
    }
  }

  async handleCursorPosition(socket, data) {
    try {
      const { noteId, position, selection } = data;
      
      if (!noteId || socket.currentNoteId !== noteId) {
        return;
      }

      socket.to(`note-${noteId}`).emit('user-cursor-position', {
        userId: socket.userId,
        user: socket.user,
        noteId,
        position,
        selection
      });
    } catch (error) {
      console.error('Error in handleCursorPosition:', error);
    }
  }

  async handleContentChange(socket, data) {
    try {
      const { noteId, content, operation, position, length, timestamp } = data;
      
      if (!noteId || socket.currentNoteId !== noteId) {
        socket.emit('error', { message: 'Not connected to this note' });
        return;
      }

      const note = await Note.findOne({ _id: noteId, isDeleted: false });
      if (!note) {
        socket.emit('error', { message: 'Note not found' });
        return;
      }

      const changeData = {
        userId: socket.userId,
        user: socket.user,
        noteId,
        operation,
        content,
        position,
        length,
        timestamp: timestamp || Date.now(),
        version: note.version || 1
      };

      socket.to(`note-${noteId}`).emit('content-changed', changeData);
      this.debouncedSave(noteId, content, socket.userId);

      console.log(`Content change processed for note ${noteId} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error in handleContentChange:', error);
      socket.emit('error', { message: 'Failed to process content change' });
    }
  }

  async handleRequestSync(socket, data) {
    try {
      const { noteId, clientVersion } = data;
      
      if (!noteId) {
        socket.emit('error', { message: 'Note ID is required' });
        return;
      }

      const note = await Note.findOne({ _id: noteId, isDeleted: false })
        .populate('owner', 'username firstName lastName avatar')
        .populate('lastEditedBy', 'username firstName lastName avatar');

      if (!note) {
        socket.emit('error', { message: 'Note not found' });
        return;
      }

      socket.emit('sync-response', {
        noteId,
        content: note.content,
        version: note.version || 1,
        lastEditedBy: note.lastEditedBy,
        updatedAt: note.updatedAt,
        needsSync: !clientVersion || clientVersion !== (note.version || 1)
      });

      console.log(`Sync response sent for note ${noteId}`);
    } catch (error) {
      console.error('Error in handleRequestSync:', error);
      socket.emit('error', { message: 'Failed to sync note' });
    }
  }

  handleDisconnect(socket, reason) {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
    
    try {
      if (socket.currentNoteId) {
        const noteId = socket.currentNoteId;
        
        if (this.activeUsers.has(noteId)) {
          this.activeUsers.get(noteId).delete(socket.userId);
          
          if (this.activeUsers.get(noteId).size === 0) {
            this.activeUsers.delete(noteId);
          }
        }

        socket.to(`note-${noteId}`).emit('user-left', {
          userId: socket.userId,
          noteId
        });
      }

      this.userSockets.delete(socket.userId);
      this.socketUsers.delete(socket.id);
      
      console.log(`Total connected users: ${this.socketUsers.size}`);
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  debouncedSave(noteId, content, userId) {
    if (this.saveTimeouts[noteId]) {
      clearTimeout(this.saveTimeouts[noteId]);
    }

    this.saveTimeouts[noteId] = setTimeout(async () => {
      try {
        const note = await Note.findOne({ _id: noteId, isDeleted: false });
        if (!note) {
          console.log('Note not found for auto-save:', noteId);
          return;
        }

        const oldContent = note.content;
        
        if (oldContent === content) {
          console.log('Content unchanged, skipping save for note:', noteId);
          return;
        }

        note.content = content;
        note.lastEditedBy = userId;
        note.version = (note.version || 1) + 1;
        await note.save();

        this.io.to(`note-${noteId}`).emit('auto-saved', {
          noteId,
          version: note.version,
          timestamp: Date.now()
        });

        console.log(`Auto-saved note ${noteId}, new version: ${note.version}`);
      } catch (error) {
        console.error('Auto-save error for note', noteId, ':', error);
        this.io.to(`note-${noteId}`).emit('save-error', {
          noteId,
          error: 'Failed to auto-save changes',
          details: error.message
        });
      }
    }, 2000);
  }

  // NEW METHODS FOR BROADCASTING NOTE CREATION

  // Broadcast public note creation to all users
  broadcastNoteCreated(note, creator) {
    try {
      if (note.isPublic) {
        console.log(`Broadcasting public note creation: ${note.title}`);
        
        const noteData = {
          _id: note._id,
          title: note.title,
          content: note.content,
          owner: note.owner,
          tags: note.tags,
          isPublic: note.isPublic,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        };

        // Broadcast to all connected users in global room
        this.io.to(this.GLOBAL_ROOM).emit('public-note-created', {
          note: noteData,
          creator: {
            id: creator.id,
            username: creator.username,
            firstName: creator.firstName,
            lastName: creator.lastName,
            avatar: creator.avatar
          },
          timestamp: Date.now()
        });

        console.log(`Public note creation broadcasted to ${this.socketUsers.size} connected users`);
      }
    } catch (error) {
      console.error('Error broadcasting note creation:', error);
    }
  }

  // Broadcast note updates (title, visibility change, etc.)
  broadcastNoteUpdated(note, updater, changes) {
    try {
      // If note became public or was already public, broadcast to global room
      if (note.isPublic || changes.isPublic?.new === true) {
        console.log(`Broadcasting note update: ${note.title}`);
        
        const noteData = {
          _id: note._id,
          title: note.title,
          content: note.content,
          owner: note.owner,
          tags: note.tags,
          isPublic: note.isPublic,
          updatedAt: note.updatedAt
        };

        this.io.to(this.GLOBAL_ROOM).emit('public-note-updated', {
          note: noteData,
          updater: {
            id: updater.id,
            username: updater.username,
            firstName: updater.firstName,
            lastName: updater.lastName,
            avatar: updater.avatar
          },
          changes,
          timestamp: Date.now()
        });
      }

      // If note became private, notify users it's no longer public
      if (changes.isPublic?.old === true && changes.isPublic?.new === false) {
        this.io.to(this.GLOBAL_ROOM).emit('public-note-privatized', {
          noteId: note._id,
          title: note.title,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error broadcasting note update:', error);
    }
  }

  // Broadcast note deletion
  broadcastNoteDeleted(note, deleter) {
    try {
      if (note.isPublic) {
        console.log(`Broadcasting public note deletion: ${note.title}`);
        
        this.io.to(this.GLOBAL_ROOM).emit('public-note-deleted', {
          noteId: note._id,
          title: note.title,
          deleter: {
            id: deleter.id,
            username: deleter.username,
            firstName: deleter.firstName,
            lastName: deleter.lastName
          },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error broadcasting note deletion:', error);
    }
  }

  getActiveUsers(noteId) {
    return this.activeUsers.get(noteId) || new Set();
  }

  emitToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  emitToNoteRoom(noteId, event, data) {
    this.io.to(`note-${noteId}`).emit(event, data);
  }

  // Emit to global room
  emitToGlobalRoom(event, data) {
    this.io.to(this.GLOBAL_ROOM).emit(event, data);
  }

  disconnectUser(userId, reason = 'Server disconnect') {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('force-disconnect', { reason });
        socket.disconnect(true);
        return true;
      }
    }
    return false;
  }

  getConnectionStats() {
    const globalRoomSize = this.io.sockets.adapter.rooms.get(this.GLOBAL_ROOM)?.size || 0;
    return {
      totalConnections: this.socketUsers.size,
      activeNotes: this.activeUsers.size,
      totalActiveUsers: Array.from(this.activeUsers.values()).reduce((sum, users) => sum + users.size, 0),
      globalRoomUsers: globalRoomSize
    };
  }

  cleanup() {
    console.log('Cleaning up SocketManager...');
    if (this.saveTimeouts) {
      Object.values(this.saveTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
      this.saveTimeouts = {};
    }
    this.activeUsers.clear();
    this.userSockets.clear();
    this.socketUsers.clear();
  }
}

module.exports = SocketManager;