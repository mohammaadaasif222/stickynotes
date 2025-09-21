import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createNote,
  updateNote,
  deleteNote,
  addCollaborator,
  removeCollaborator,
  fetchNotes,
  fetchNote,
  setSearchQuery,
  setSortOptions
} from '../../store/slices/noteSlice';
import { useNotesSocket } from '../../hooks/useNotesSocket';
import {
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  ChevronUp as SortAscIcon,
  ChevronDown as SortDescIcon,
  Loader2 as LoaderIcon,
  Save as SaveIcon,
  X as XIcon,
  Users as UsersIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Eye as EyeIcon
} from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { Edit3, UserPlus, Trash2, Users, Calendar, Eye, Lock, User, Tag, History } from 'lucide-react';
import NoteHistory from '../../components/notes/NoteHistory';

const CreateNoteModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    isPublic: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(createNote(formData)).unwrap();
      setFormData({ title: '', content: '', tags: [], isPublic: false });
      setTagInput('');
      onClose();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              placeholder="Enter note content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this note public
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditNoteModal = ({ note, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const {
    joinNote,
    leaveNote,
    sendContentChange,
    startTyping,
    stopTyping,
    activeUsers,
    isConnected
  } = useNotesSocket();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    isPublic: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for managing typing and auto-save
  const contentRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const lastSyncedContentRef = useRef('');
  const currentNoteIdRef = useRef(null);

  // Get active users for current note
  const currentNoteUsers = activeUsers.filter(user => user.noteId === note?._id);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        isPublic: note.isPublic || false
      });
      lastSyncedContentRef.current = note.content || '';
      currentNoteIdRef.current = note._id;

      // Join the note for real-time collaboration
      if (isConnected && note._id) {
        console.log('Joining note for collaboration:', note._id);
        joinNote(note._id);
      }
    }
  }, [note, isConnected, joinNote]);

  useEffect(() => {
    // Leave note when modal closes
    return () => {
      if (currentNoteIdRef.current) {
        leaveNote(currentNoteIdRef.current);
        stopTyping(currentNoteIdRef.current);
      }

      // Clear timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [leaveNote, stopTyping]);

  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value;
    const noteId = currentNoteIdRef.current;

    setFormData(prev => ({ ...prev, content: newContent }));
    setHasUnsavedChanges(newContent !== lastSyncedContentRef.current);

    if (isConnected && noteId) {
      // Send real-time content change
      const operation = 'edit';
      const position = e.target.selectionStart || 0;
      const length = newContent.length;

      sendContentChange(noteId, newContent, operation, position, length);

      // Start typing indicator
      startTyping(noteId, position);

      // Clear existing typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new typing timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(noteId);
      }, 1000);

      // Auto-save after 2 seconds of inactivity
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(newContent);
      }, 2000);
    }
  }, [isConnected, sendContentChange, startTyping, stopTyping]);

  const handleAutoSave = useCallback(async (content) => {
    if (!note?._id || content === lastSyncedContentRef.current) return;

    try {
      const updatedData = { ...formData, content };
      await dispatch(updateNote({
        noteId: note._id,
        noteData: updatedData
      })).unwrap();

      lastSyncedContentRef.current = content;
      setHasUnsavedChanges(false);
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [dispatch, note?._id, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(updateNote({
        noteId: note._id,
        noteData: formData
      })).unwrap();

      lastSyncedContentRef.current = formData.content;
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Edit Note</h2>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <WifiIcon className="w-4 h-4" />
                  <span className="text-xs">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <WifiOffIcon className="w-4 h-4" />
                  <span className="text-xs">Offline</span>
                </div>
              )}

              {/* Active Users Indicator */}
              {currentNoteUsers.length > 0 && (
                <div className="flex items-center gap-1 text-blue-600">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-xs">{currentNoteUsers.length}</span>
                </div>
              )}

              {/* Unsaved Changes Indicator */}
              {hasUnsavedChanges && (
                <div className="text-xs text-orange-600">
                  Unsaved changes
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Active Users Display */}
        {currentNoteUsers.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <EyeIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Currently viewing ({currentNoteUsers.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentNoteUsers.map((user, index) => (
                <div
                  key={`${user.userId}-${index}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 text-xs rounded-full border border-blue-200"
                >
                  {user.firstName || user.username || 'Anonymous'}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              ref={contentRef}
              value={formData.content}
              onChange={handleContentChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-vertical"
              placeholder="Enter note content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-700">
              Make this note public
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
              <SaveIcon className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddCollaboratorModal = ({ noteId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('read-only');
  const [isLoading, setIsLoading] = useState(false);
  const { users, getUsers } = useUsers()

  useEffect(() => {
    getUsers()
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setIsLoading(true);
    try {
      await dispatch(addCollaborator({
        noteId,
        userId: userId.trim(),
        role
      })).unwrap();
      setUserId('');
      setRole('read-only');
      onClose();
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Collaborator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div><div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Users*
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="" disabled>
                -- Select a user --
              </option>
              {users &&
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
            </select>
          </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="read-only">Read Only</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
              <UserPlusIcon className="w-4 h-4" />
              Add Collaborator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NoteCard = ({ note, onEdit, onDelete, onAddCollaborator, onViewHistory, activeUsers = [] }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get active users for this note
  const noteActiveUsers = activeUsers.filter(user => user.noteId === note._id);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(note._id);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(note);
  };

  const handleAddCollaborator = () => {
    if (onAddCollaborator) onAddCollaborator(note._id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-indigo-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden">
      
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
      
      {/* Live indicator for notes with active users */}
      {noteActiveUsers.length > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs rounded-full shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Live ({noteActiveUsers.length})</span>
          </div>
        </div>
      )}

      {/* Header with title and actions */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{note.owner.fullName}</span>
            </div>
            <span>•</span>
            <span>v{note.version}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100/80 rounded-lg transition-colors"
            title="Edit note"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddCollaborator}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100/80 rounded-lg transition-colors"
            title="Add collaborator"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100/80 rounded-lg transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewHistory && onViewHistory(note._id)}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100/80 rounded-lg transition-colors"
            title="View history"
          >
            <HistoryIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className="mb-4 relative z-10">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
          {note.content}
        </p>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Last edited by section */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Edit3 className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-600">
            Last edited by: <span className="font-medium text-gray-800">{note.lastEditedBy.fullName}</span>
          </span>
        </div>
      </div>

      {/* Collaborators section */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {note.collaboratorCount} collaborator{note.collaboratorCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Display collaborators if any */}
        {note.collaborators && note.collaborators.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {note.collaborators.map((collab, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-sm"
              >
                <span>
                  {collab.user?.fullName || collab.user?.firstName || collab.user?.username || 'Unknown'}
                </span>
                {collab.role && (
                  <span className="bg-white/20 px-1 rounded text-xs">
                    {collab.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic bg-gray-50/60 rounded-lg px-3 py-2">
            No collaborators yet - click the + button to add someone!
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="flex justify-between items-center text-xs text-gray-600 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {note.isPublic ? (
              <>
                <Eye className="w-3 h-3" />
                <span className="text-emerald-600 font-medium">Public</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span className="text-amber-600 font-medium">Private</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span title={`Updated: ${formatDate(note.updatedAt)}`}>
            {getTimeAgo(note.updatedAt)}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Note</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isDeleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Notes Management Component
const Notes = () => {
  const dispatch = useDispatch();
  const { notes, isLoading, searchQuery, sortBy, sortOrder } = useSelector(state => state.notes);
  const { isConnected, realtimeUpdates, getRecentUpdates, clearRealtimeUpdate } = useNotesSocket();
  const searchTimeout = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
   
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showRealtimeUpdates, setShowRealtimeUpdates] = useState(false);

  const handleViewHistory = (noteId) => {
    const note = notes.find(n => n._id === noteId);
    if (note) {
      setSelectedNote(note);
      setShowHistory(true);
    }
  };

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch, searchQuery, sortBy, sortOrder]);

  const handleSearch = useCallback((query) => {
    // Debounce search to avoid too many API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      dispatch(setSearchQuery(query));
    }, 300);
  }, [dispatch]);

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSortOptions({ sortBy: field, sortOrder: newOrder }));
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowEditModal(true);
  };

  const handleAddCollaborator = (noteId) => {
    setSelectedNoteId(noteId);
    setShowCollaboratorModal(true);
  };

  // Get recent real-time updates
  const recentUpdates = getRecentUpdates(5);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showHistory && selectedNote && (
        <NoteHistory
          noteId={selectedNote._id}
          onClose={() => {
            setShowHistory(false);
            setSelectedNote(null);
          }}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notes Management</h1>
        <div className="flex items-center gap-4">
          {/* Real-time Status and Updates */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <WifiIcon className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <WifiOffIcon className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}

            {/* Real-time Updates Toggle */}
            {recentUpdates.length > 0 && (
              <button
                onClick={() => setShowRealtimeUpdates(!showRealtimeUpdates)}
                className="relative px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
              >
                Updates ({recentUpdates.length})
                {recentUpdates.some(update => update.isError) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Note
          </button>
        </div>
      </div>

      {/* Real-time Updates Panel */}
      {showRealtimeUpdates && recentUpdates.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Recent Updates</h3>
            <button
              onClick={() => setShowRealtimeUpdates(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                className={`flex justify-between items-center p-2 text-xs rounded ${update.isError
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}
              >
                <span className="flex-1">{update.message}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => clearRealtimeUpdate(update.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes by title..."
            className={`w-full pl-10 pr-${isLoading ? '10' : '4'} py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              searchQuery && !isLoading && notes.length === 0 ? 'border-yellow-300' : ''
            }`}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoaderIcon className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('title')}
            className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 ${sortBy === 'title'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Title
            {sortBy === 'title' && (
              sortOrder === 'asc' ? <SortAscIcon className="w-3 h-3" /> : <SortDescIcon className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('updatedAt')}
            className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 ${sortBy === 'updatedAt'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Updated
            {sortBy === 'updatedAt' && (
              sortOrder === 'asc' ? <SortAscIcon className="w-3 h-3" /> : <SortDescIcon className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading notes...</span>
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.filter((item)=>item.title.includes(searchQuery)).length > 0 ? (
            notes.filter((item)=>item.title.includes(searchQuery)).map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEditNote}
                onDelete={() => { }}
                onAddCollaborator={handleAddCollaborator}
                onViewHistory={handleViewHistory}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchQuery ? (
                <div>
                  <p className="mb-2">No notes found matching "{searchQuery}"</p>
                  <button
                    onClick={() => handleSearch('')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                'No notes found. Create your first note to get started!'
              )}
            </div>
          )}
        </div>
      )}

      {/* Connection Status Footer */}
      {!isConnected && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-700">
            <WifiOffIcon className="w-4 h-4" />
            <span className="text-sm">
              You're currently offline. Real-time collaboration features are unavailable.
            </span>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditNoteModal
        note={selectedNote}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedNote(null);
        }}
      />

      <AddCollaboratorModal
        noteId={selectedNoteId}
        isOpen={showCollaboratorModal}
        onClose={() => {
          setShowCollaboratorModal(false);
          setSelectedNoteId(null);
        }}
      />
    </div>
  );
};

export default Notes;