import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Eye, Users, Clock, Globe, Lock } from 'lucide-react';
import socketService from '../../services/socketService';
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
import { useDispatch, useSelector } from 'react-redux';

const RealTimeNotesDashboard = () => {
  const dispatch = useDispatch();
  const { notes, isLoading, searchQuery, sortBy, sortOrder } = useSelector(state => state.notes);
//   const [notes, setNotes] = useState([...n]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [globalUpdatesEnabled, setGlobalUpdatesEnabled] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });

  // Handle socket connection
  useEffect(() => {
    const t = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const token  = t.slice(1, -1)
    if (token && !socketService.isSocketConnected()) {
      socketService.connect(token);
    }

    // Socket event handlers
    const handleConnection = () => {
      setIsConnected(true);
      setGlobalUpdatesEnabled(socketService.isGlobalUpdatesActive());
    };

    const handleDisconnection = () => {
      setIsConnected(false);
      setGlobalUpdatesEnabled(false);
    };

    const handlePublicNoteCreated = (data) => {
      console.log('New public note received:', data);
      
      // Add to notes list
    //   setNotes(prevNotes => [data.note, ...prevNotes]);
      
      // Add to activity feed
      const activity = {
        id: `created-${data.note._id}-${Date.now()}`,
        type: 'created',
        note: data.note,
        user: data.creator,
        timestamp: data.timestamp,
        message: `${data.creator.firstName || data.creator.username} created a new public note`
      };
      
      setRecentActivity(prevActivity => [activity, ...prevActivity.slice(0, 9)]);
    };

    const handlePublicNoteUpdated = (data) => {
      console.log('Public note updated:', data);
      
      // Update notes list
    //   setNotes(prevNotes => 
    //     prevNotes.map(note => 
    //       note._id === data.note._id ? data.note : note
    //     )
    //   );
      
      // Add to activity feed
      let message = `${data.updater.firstName || data.updater.username} updated`;
      if (data.changes.isPublic?.new === true) {
        message += ' and made public';
      }
      message += ` "${data.note.title}"`;
      
      const activity = {
        id: `updated-${data.note._id}-${Date.now()}`,
        type: 'updated',
        note: data.note,
        user: data.updater,
        timestamp: data.timestamp,
        message,
        changes: data.changes
      };
      
      setRecentActivity(prevActivity => [activity, ...prevActivity.slice(0, 9)]);
    };

    const handlePublicNoteDeleted = (data) => {
      console.log('Public note deleted:', data);
      
      // Remove from notes list
    //   setNotes(prevNotes => prevNotes.filter(note => note._id !== data.noteId));
      
      // Add to activity feed
      const activity = {
        id: `deleted-${data.noteId}-${Date.now()}`,
        type: 'deleted',
        noteId: data.noteId,
        title: data.title,
        user: data.deleter,
        timestamp: data.timestamp,
        message: `${data.deleter.firstName || data.deleter.username} deleted "${data.title}"`
      };
      
      setRecentActivity(prevActivity => [activity, ...prevActivity.slice(0, 9)]);
    };

    const handlePublicNotePrivatized = (data) => {
      console.log('Note became private:', data);
      
      // Remove from public notes list
    //   setNotes(prevNotes => prevNotes.filter(note => note._id !== data.noteId));
      
      // Add to activity feed
      const activity = {
        id: `privatized-${data.noteId}-${Date.now()}`,
        type: 'privatized',
        noteId: data.noteId,
        title: data.title,
        timestamp: data.timestamp,
        message: `"${data.title}" is no longer public`
      };
      
      setRecentActivity(prevActivity => [activity, ...prevActivity.slice(0, 9)]);
    };

    // Register socket listeners
    socketService.on('socket-connected', handleConnection);
    socketService.on('socket-disconnected', handleDisconnection);
    socketService.on('public-note-created', handlePublicNoteCreated);
    socketService.on('public-note-updated', handlePublicNoteUpdated);
    socketService.on('public-note-deleted', handlePublicNoteDeleted);
    socketService.on('public-note-privatized', handlePublicNotePrivatized);

    // Cleanup on unmount
    return () => {
      socketService.off('socket-connected', handleConnection);
      socketService.off('socket-disconnected', handleDisconnection);
      socketService.off('public-note-created', handlePublicNoteCreated);
      socketService.off('public-note-updated', handlePublicNoteUpdated);
      socketService.off('public-note-deleted', handlePublicNoteDeleted);
      socketService.off('public-note-privatized', handlePublicNotePrivatized);
    };
  }, []);

  // Mock function to create a note (replace with your actual API call)
  const createNote = async () => {
    try {
    const t = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const token  = t.slice(1, -1)
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNote)
      });
      
      if (response.ok) {
        setNewNote({ title: '', content: '', isPublic: false });
        setShowCreateForm(false);
        // Note will be added to list via socket event if public
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const toggleGlobalUpdates = () => {
    if (globalUpdatesEnabled) {
      socketService.disableGlobalUpdates();
    } else {
      socketService.enableGlobalUpdates();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time collaborative notes</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Global Updates Toggle */}
            <button
              onClick={toggleGlobalUpdates}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                globalUpdatesEnabled 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell size={16} />
              <span>{globalUpdatesEnabled ? 'Live Updates On' : 'Live Updates Off'}</span>
            </button>
            
            {/* Create Note Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Create Note</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Public Notes List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Public Notes</h2>
                <p className="text-gray-600 text-sm mt-1">{notes.length} public notes available</p>
              </div>
              
              <div className="divide-y">
                {notes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No public notes yet. Create one to get started!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                            <Globe size={16} className="text-blue-500" />
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {note.content.substring(0, 150)}...
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <img
                                  src={note.owner.avatar || '/api/placeholder/24/24'}
                                  alt={note.owner.firstName || note.owner.username}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{note.owner.firstName || note.owner.username}</span>
                              </div>
                              
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {note.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatTime(note.updatedAt || note.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button className="text-blue-600 hover:text-blue-700 transition-colors">
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-gray-600 text-sm mt-1">Live updates from all users</p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            activity.type === 'created' ? 'bg-green-500' :
                            activity.type === 'updated' ? 'bg-blue-500' :
                            activity.type === 'deleted' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {activity.user && (
                                  <img
                                    src={activity.user.avatar || '/api/placeholder/20/20'}
                                    alt={activity.user.firstName || activity.user.username}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTime(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Note Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter note title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your note content..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newNote.isPublic}
                    onChange={(e) => setNewNote({...newNote, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700 flex items-center">
                    <Globe size={16} className="mr-1" />
                    Make this note public
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNote}
                  disabled={!newNote.title || !newNote.content}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeNotesDashboard;