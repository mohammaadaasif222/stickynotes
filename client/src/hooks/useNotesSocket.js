import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socketService from '../services/socketService';
import { selectUserToken } from '../store/slices/authSlice';

export const useNotesSocket = (options = {}) => {
  const {
    onNoteUpdated,
    onNoteDeleted,
    onNoteCreated,
    onContentChanged,
    onNoteContentUpdate,
    enableAutoSync = true,
    enableGlobalUpdates = true 
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [currentNoteData, setCurrentNoteData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGlobalUpdatesActive, setIsGlobalUpdatesActive] = useState(false);
  const [globalNotes, setGlobalNotes] = useState([]); // Track public notes

  const token = useSelector(selectUserToken);
  const dispatch = useDispatch();

  // Refs to track cleanup and debouncing
  const listenersRef = useRef(new Set());
  const updateIdCounterRef = useRef(0);
  const typingTimeoutsRef = useRef(new Map());
  const syncTimeoutRef = useRef(null);

  // Helper to generate unique update IDs
  const generateUpdateId = useCallback(() => {
    return `update_${Date.now()}_${++updateIdCounterRef.current}`;
  }, []);

  // Add realtime update with enhanced metadata
  const addRealtimeUpdate = useCallback((type, message, isError = false, data = null) => {
    const update = {
      id: generateUpdateId(),
      type,
      message,
      isError,
      timestamp: Date.now(),
      data,
      noteId: data?.noteId || data?.note?._id || null,
      userId: data?.creator?._id || data?.updater?._id || data?.deleter?._id || null,
      userName: data?.creator?.firstName || data?.creator?.username ||
        data?.updater?.firstName || data?.updater?.username ||
        data?.deleter?.firstName || data?.deleter?.username || null
    };

    setRealtimeUpdates(prev => {
      // Keep only last 50 updates and remove duplicates
      const filtered = prev.filter(u => !(u.type === type && u.message === message && u.timestamp > Date.now() - 1000));
      const newUpdates = [update, ...filtered.slice(0, 49)];
      return newUpdates;
    });
  }, [generateUpdateId]);

  // Handle content synchronization with version control
  const handleContentSync = useCallback((data) => {
    if (!enableAutoSync) return;

    setCurrentNoteData(prev => {
      if (!prev || prev._id !== data.noteId) return prev;

      const { content, version, operation, position, text, length } = data;

      // If this is a version conflict notification, request a sync
      if (data.type === 'sync-required') {
        console.log('Version conflict detected, requesting sync');
        socketService.requestSync(data.noteId, prev.version);
        return prev;
      }

      // If this is an operation-based change
      if (operation && prev.version === version) {
        const { transformOperation, applyOperation } = require('../../server/utils/operationalTransform');
        
        // Transform any pending local operations against the received operation
        let newContent = prev.content;
        
        // Apply the transformed operation
        const op = {
          type: operation,
          position: position,
          text: text,
          length: length
        };
        
        newContent = applyOperation(newContent, op);

        const updatedNote = {
          ...prev,
          content: newContent,
          version: version,
          lastEditedBy: data.lastEditedBy || prev.lastEditedBy,
          updatedAt: data.timestamp || prev.updatedAt
        };

        // Update the Redux store
        dispatch(updateNoteFromSocket(updatedNote));

        return updatedNote;
      }

      // If this is a full content update (after sync)
      if (content !== undefined && (!prev.version || version > prev.version)) {
        const updatedNote = {
          ...prev,
          content: content,
          version: version,
          lastEditedBy: data.lastEditedBy || prev.lastEditedBy,
          updatedAt: data.timestamp || prev.updatedAt
        };

        // Update the Redux store
        dispatch(updateNoteFromSocket(updatedNote));

        return updatedNote;
      }

      return prev;
    });
  }, [enableAutoSync, dispatch]);

  // Setup socket listeners
  const setupSocketListeners = useCallback(() => {
    if (!socketService) return;

    // Connection status listeners
    const onSocketConnected = (data) => {
      console.log('Socket connected in hook');
      setIsConnected(true);
      setConnectionError(null);
      addRealtimeUpdate('connection', 'Connected to real-time updates', false);
    };

    const onSocketDisconnected = (data) => {
      console.log('Socket disconnected in hook:', data.reason);
      setIsConnected(false);
      setIsGlobalUpdatesActive(false);
      setActiveUsers([]);
      setTypingUsers(new Map());
      addRealtimeUpdate('connection', 'Disconnected from real-time updates', true);
    };

    const onSocketError = (data) => {
      console.error('Socket error in hook:', data);
      setConnectionError(data.message);
      addRealtimeUpdate('error', `Connection error: ${data.message}`, true);
    };

    // Global updates listeners (NEW)
    const onGlobalUpdatesJoined = (data) => {
      console.log('Global updates joined:', data);
      setIsGlobalUpdatesActive(true);
      addRealtimeUpdate('global-updates', 'Subscribed to global note updates', false, data);
    };

    const onGlobalUpdatesLeft = (data) => {
      console.log('Global updates left:', data);
      setIsGlobalUpdatesActive(false);
      addRealtimeUpdate('global-updates', 'Unsubscribed from global note updates', false, data);
    };

    const onPublicNoteCreated = (data) => {
      console.log('Public note created:', data);
      const creatorName = data.creator.firstName || data.creator.username;
      const message = `${creatorName} created "${data.note.title}"`;

      addRealtimeUpdate('public-note-created', message, false, data);

      // Add to global notes list
      setGlobalNotes(prev => {
        const exists = prev.some(note => note._id === data.note._id);
        if (!exists) {
          return [data.note, ...prev];
        }
        return prev;
      });

      // Call custom handler
      if (onNoteCreated) {
        onNoteCreated({
          type: 'public-note-created',
          note: data.note,
          creator: data.creator,
          timestamp: data.timestamp
        });
      }

      // Update Redux store in real time for all users
      dispatch({ type: 'notes/updateNoteFromSocket', payload: data.note });
    };

    const onPublicNoteUpdated = (data) => {
      console.log('Public note updated:', data);
      const updaterName = data.updater.firstName || data.updater.username;

      let message = `${updaterName} updated "${data.note.title}"`;
      let updateType = 'public-note-updated';

      // Different messages based on what changed
      if (data.changes.isPublic?.new === true) {
        message = `${updaterName} made "${data.note.title}" public`;
        updateType = 'note-made-public';

        // Add to global notes if newly public
        setGlobalNotes(prev => {
          const exists = prev.some(note => note._id === data.note._id);
          if (!exists) {
            return [data.note, ...prev];
          }
          return prev.map(note => note._id === data.note._id ? data.note : note);
        });
      } else {
        // Update existing note in global notes
        setGlobalNotes(prev => prev.map(note =>
          note._id === data.note._id ? { ...note, ...data.note } : note
        ));
      }

      addRealtimeUpdate(updateType, message, false, data);

      // Call custom handler
      if (onNoteUpdated) {
        onNoteUpdated({
          type: updateType,
          note: data.note,
          updater: data.updater,
          changes: data.changes,
          timestamp: data.timestamp
        });
      }

      // Update Redux store in real time for all users
      dispatch({ type: 'notes/updateNoteFromSocket', payload: data.note });
    };

    const onPublicNotePrivatized = (data) => {
      console.log('Public note privatized:', data);
      const message = `"${data.title}" is no longer public`;

      addRealtimeUpdate('public-note-privatized', message, false, data);

      // Remove from global notes
      setGlobalNotes(prev => prev.filter(note => note._id !== data.noteId));

      // Call custom handler
      if (onNoteUpdated) {
        onNoteUpdated({
          type: 'public-note-privatized',
          noteId: data.noteId,
          title: data.title,
          timestamp: data.timestamp
        });
      }
    };

    const onPublicNoteDeleted = (data) => {
      console.log('Public note deleted:', data);
      const deleterName = data.deleter.firstName || data.deleter.username;
      const message = `${deleterName} deleted "${data.title}"`;

      addRealtimeUpdate('public-note-deleted', message, false, data);

      // Remove from global notes
      setGlobalNotes(prev => prev.filter(note => note._id !== data.noteId));

      // Call custom handler
      if (onNoteDeleted) {
        onNoteDeleted({
          type: 'public-note-deleted',
          noteId: data.noteId,
          title: data.title,
          deleter: data.deleter,
          timestamp: data.timestamp
        });
      }

      // Update Redux store if using Redux
      // dispatch(removeNoteFromList(data.noteId));
    };

    // Note events with enhanced handling
    const onNoteJoined = (data) => {
      console.log('Note joined in hook:', data);
      addRealtimeUpdate('note-joined', `Joined note: ${data.note?.title || 'Unknown'}`, false, data);

      // Store current note data
      if (data.note) {
        setCurrentNoteData(data.note);
      }

      // Update active users if provided
      if (data.activeUsers) {
        const usersWithNoteId = data.activeUsers.map(user => ({
          ...user,
          noteId: data.noteId,
          userId: user._id || user.id
        }));
        setActiveUsers(usersWithNoteId);
      }
    };

    const onUserJoined = (data) => {
      console.log('User joined in hook:', data);
      addRealtimeUpdate('user-joined', `${data.user.firstName || data.user.username} joined the note`, false, data);

      // Add user to active users
      setActiveUsers(prev => {
        const exists = prev.some(u => u.userId === data.user.id && u.noteId === data.noteId);
        if (!exists) {
          return [...prev, {
            userId: data.user.id,
            username: data.user.username,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            avatar: data.user.avatar,
            noteId: data.noteId
          }];
        }
        return prev;
      });
    };

    const onUserLeft = (data) => {
      console.log('User left in hook:', data);
      // Remove user from active users and typing users
      setActiveUsers(prev => prev.filter(u => !(u.userId === data.userId && u.noteId === data.noteId)));
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    const onNoteLeft = (data) => {
      console.log('Note left in hook:', data);
      addRealtimeUpdate('note-left', 'Left the note', false, data);

      // Clear all note-related state
      setActiveUsers([]);
      setTypingUsers(new Map());
      setCurrentNoteData(null);
    };

    // Enhanced content change handling
    const onContentChanged = (data) => {
      console.log('Content changed in hook:', data);
      const userName = data.user.firstName || data.user.username;
      addRealtimeUpdate('content-changed', `${userName} is editing`, false, data);

      // Handle content synchronization
      if (data.content !== undefined) {
        handleContentSync(data);
      }

      // Call custom handler if provided
      if (onContentChanged) {
        onContentChanged(data);
      }
    };

    // Typing indicators
    const onUserTypingStart = (data) => {
      const userName = data.user.firstName || data.user.username;
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          ...data.user,
          startTime: Date.now(),
          cursorPosition: data.cursorPosition
        });
        return newMap;
      });

      // Clear existing timeout and set new one
      if (typingTimeoutsRef.current.has(data.userId)) {
        clearTimeout(typingTimeoutsRef.current.get(data.userId));
      }

      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
        typingTimeoutsRef.current.delete(data.userId);
      }, 5000); // Remove typing indicator after 5 seconds

      typingTimeoutsRef.current.set(data.userId, timeout);
    };

    const onUserTypingStop = (data) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });

      // Clear timeout
      if (typingTimeoutsRef.current.has(data.userId)) {
        clearTimeout(typingTimeoutsRef.current.get(data.userId));
        typingTimeoutsRef.current.delete(data.userId);
      }
    };

    // Enhanced sync handling
    const onSyncResponse = (data) => {
      console.log('Sync response received:', data);
      setIsSyncing(false);

      if (data.needsSync) {
        setCurrentNoteData(prev => {
          if (!prev || prev._id !== data.noteId) return prev;

          return {
            ...prev,
            content: data.content,
            version: data.version,
            lastEditedBy: data.lastEditedBy,
            updatedAt: data.updatedAt
          };
        });

        addRealtimeUpdate('sync', 'Note synchronized with server', false, data);

        // Call custom handler
        if (onNoteContentUpdate) {
          onNoteContentUpdate({
            noteId: data.noteId,
            content: data.content,
            version: data.version,
            lastEditedBy: data.lastEditedBy
          });
        }
      }
    };

    const onAutoSaved = (data) => {
      console.log('Auto-saved in hook:', data);
      addRealtimeUpdate('auto-saved', 'Changes saved automatically', false, data);

      // Update local version and content
      setCurrentNoteData(prev => {
        if (!prev || prev._id !== data.noteId) return prev;
        const updatedNote = { 
          ...prev, 
          version: data.version,
          content: data.content,
          updatedAt: data.timestamp
        };

        // Update Redux store to reflect changes in the notes list
        dispatch(updateNoteFromSocket(updatedNote));

        return updatedNote;
      });
    };

    const onSaveError = (data) => {
      console.error('Save error in hook:', data);
      addRealtimeUpdate('save-error', 'Failed to save changes', true, data);
    };

    // Enhanced note update handling (for current user's notes)
    const onNoteUpdatedEvent = (data) => {
      console.log('Note updated event:', data);
      const noteName = data.note?.title || 'Unknown note';
      const updaterName = data.updatedBy?.firstName || data.updatedBy?.username || 'Someone';

      addRealtimeUpdate('note-updated', `${updaterName} updated "${noteName}"`, false, data);

      // Update local note data if it's the current note
      setCurrentNoteData(prev => {
        if (!prev || prev._id !== data.noteId) return prev;

        const updatedNote = {
          ...prev,
          ...data.note,
          version: data.note.version,
          lastEditedBy: data.note.lastEditedBy,
          updatedAt: data.note.updatedAt
        };

        // Update Redux store to reflect changes in the notes list
        dispatch(updateNoteFromSocket(updatedNote));

        return updatedNote;
      });

      // If it's not the current note, still update the Redux store
      if (data.note && !currentNoteData || data.note._id !== currentNoteData?._id) {
        dispatch(updateNoteFromSocket(data.note));
      }

      // Call custom handler
      if (onNoteUpdated) {
        onNoteUpdated(data);
      }
    };

    const onNoteDeletedEvent = (data) => {
      console.log('Note deleted event:', data);
      addRealtimeUpdate('note-deleted', 'A note was deleted', false, data);

      // Clear current note if it was deleted
      setCurrentNoteData(prev => {
        if (prev && prev._id === data.noteId) {
          return null;
        }
        return prev;
      });

      // Remove users from deleted note
      setActiveUsers(prev => prev.filter(u => u.noteId !== data.noteId));
      setTypingUsers(new Map());

      // Call custom handler
      if (onNoteDeleted) {
        onNoteDeleted(data);
      }

      // Update Redux store to remove note from list
      dispatch(removeNoteFromSocket(data.noteId));
    };

    const onCollaboratorAdded = (data) => {
      addRealtimeUpdate('collaborator-added', 'New collaborator added to note', false, data);
    };

    const onCollaboratorRemoved = (data) => {
      addRealtimeUpdate('collaborator-removed', 'Collaborator removed from note', false, data);
    };

    // Register all listeners
    const listeners = [
      ['socket-connected', onSocketConnected],
      ['socket-disconnected', onSocketDisconnected],
      ['socket-error', onSocketError],
      ['global-updates-joined', onGlobalUpdatesJoined],
      ['global-updates-left', onGlobalUpdatesLeft],
      ['public-note-created', onPublicNoteCreated],
      ['public-note-updated', onPublicNoteUpdated],
      ['public-note-privatized', onPublicNotePrivatized],
      ['public-note-deleted', onPublicNoteDeleted],
      ['note-joined', onNoteJoined],
      ['user-joined', onUserJoined],
      ['user-left', onUserLeft],
      ['note-left', onNoteLeft],
      ['content-changed', onContentChanged],
      ['user-typing-start', onUserTypingStart],
      ['user-typing-stop', onUserTypingStop],
      ['sync-response', onSyncResponse],
      ['auto-saved', onAutoSaved],
      ['save-error', onSaveError],
      ['note-updated', onNoteUpdatedEvent],
      ['note-deleted', onNoteDeletedEvent],
      ['collaborator-added', onCollaboratorAdded],
      ['collaborator-removed', onCollaboratorRemoved]
    ];

    listeners.forEach(([event, callback]) => {
      socketService.on(event, callback);
      listenersRef.current.add([event, callback]);
    });

  }, [
    addRealtimeUpdate,
    handleContentSync,
    onNoteUpdated,
    onNoteDeleted,
    onNoteCreated,
    onContentChanged,
    onNoteContentUpdate,
    dispatch
  ]);

  // Cleanup socket listeners
  const cleanupSocketListeners = useCallback(() => {
    // Clear typing timeouts
    typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    typingTimeoutsRef.current.clear();

    // Clear sync timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Remove all listeners
    listenersRef.current.forEach(([event, callback]) => {
      socketService.off(event, callback);
    });
    listenersRef.current.clear();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (token && !isConnected) {
      console.log('Initializing socket connection with token');

      setupSocketListeners();

      socketService.connect(token)
        .then(() => {
          console.log('Socket connected successfully');
          setIsConnected(true);

          // Enable global updates if requested
          if (enableGlobalUpdates) {
            setTimeout(() => {
              socketService.enableGlobalUpdates();
            }, 500); // Small delay to ensure connection is stable
          }
        })
        .catch(error => {
          console.error('Failed to connect socket:', error);
          setConnectionError(error.message);
          addRealtimeUpdate('error', `Failed to connect: ${error.message}`, true);
        });
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [token, isConnected, enableGlobalUpdates, setupSocketListeners, cleanupSocketListeners, addRealtimeUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSocketListeners();
      if (socketService.isSocketConnected()) {
        socketService.disconnect();
      }
    };
  }, [cleanupSocketListeners]);

  // Enhanced join note function
  const joinNote = useCallback((noteId, noteData = null) => {
    if (!socketService.isSocketConnected()) {
      console.warn('Cannot join note: socket not connected');
      addRealtimeUpdate('error', 'Cannot join note: not connected', true);
      return false;
    }

    console.log('Joining note via hook:', noteId);

    // Store note data if provided
    if (noteData) {
      setCurrentNoteData(noteData);
    }

    const success = socketService.joinNote(noteId);

    if (!success) {
      addRealtimeUpdate('error', 'Failed to join note', true);
    }

    return success;
  }, [addRealtimeUpdate]);

  // Enhanced leave note function
  const leaveNote = useCallback((noteId) => {
    if (!socketService.isSocketConnected()) {
      return false;
    }

    console.log('Leaving note via hook:', noteId);
    const success = socketService.leaveNote(noteId);

    // Clear note-related state
    setActiveUsers([]);
    setTypingUsers(new Map());
    setCurrentNoteData(null);

    return success;
  }, []);

  // Enhanced send content change with versioning and transformation
  const sendContentChange = useCallback((noteId, content, operation, position, length) => {
    if (!socketService.isSocketConnected()) {
      addRealtimeUpdate('error', 'Cannot send changes: not connected', true);
      return false;
    }

    // Get current version from note data
    const currentNoteVersion = currentNoteData?.version || 1;

    return socketService.sendContentChange(
      noteId, 
      content, 
      operation, 
      position, 
      length,
      currentNoteVersion
    );
  }, [addRealtimeUpdate, currentNoteData]);

  // Request sync with timeout
  const requestSync = useCallback((noteId, clientVersion) => {
    if (!socketService.isSocketConnected()) {
      addRealtimeUpdate('error', 'Cannot sync: not connected', true);
      return false;
    }

    setIsSyncing(true);

    // Set timeout for sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      setIsSyncing(false);
      addRealtimeUpdate('error', 'Sync timeout - please try again', true);
    }, 10000); // 10 second timeout

    return socketService.requestSync(noteId, clientVersion);
  }, [addRealtimeUpdate]);

  // Global updates control
  const toggleGlobalUpdates = useCallback((enable) => {
    if (!socketService.isSocketConnected()) {
      addRealtimeUpdate('error', 'Cannot toggle global updates: not connected', true);
      return false;
    }

    if (enable && !isGlobalUpdatesActive) {
      return socketService.enableGlobalUpdates();
    } else if (!enable && isGlobalUpdatesActive) {
      return socketService.disableGlobalUpdates();
    }

    return true;
  }, [isGlobalUpdatesActive, addRealtimeUpdate]);

  // Get typing users for current note
  const getTypingUsers = useCallback((noteId) => {
    if (!noteId) return [];

    return Array.from(typingUsers.values()).filter(user => {
      // Only show users typing in the current note
      return true; // All users in typingUsers are for current note
    });
  }, [typingUsers]);

  // Enhanced connection status
  const getConnectionStatus = useCallback(() => {
    return {
      isConnected: isConnected && socketService.isSocketConnected(),
      hasError: !!connectionError,
      error: connectionError,
      currentNoteId: socketService.getCurrentNoteId(),
      activeUsersCount: activeUsers.length,
      typingUsersCount: typingUsers.size,
      isSyncing,
      currentNoteData,
      isGlobalUpdatesActive: isGlobalUpdatesActive && socketService.isGlobalUpdatesActive(),
      globalNotesCount: globalNotes.length
    };
  }, [isConnected, connectionError, activeUsers.length, typingUsers.size, isSyncing, currentNoteData, isGlobalUpdatesActive, globalNotes.length]);

  // Get recent global updates
  const getGlobalUpdates = useCallback((limit = 10) => {
    return realtimeUpdates
      .filter(update => ['public-note-created', 'public-note-updated', 'public-note-privatized', 'public-note-deleted', 'note-made-public'].includes(update.type))
      .slice(0, limit);
  }, [realtimeUpdates]);

  return {
    // Connection state
    isConnected: isConnected && socketService.isSocketConnected(),
    connectionError,
    isSyncing,

    // Global updates state (NEW)
    isGlobalUpdatesActive: isGlobalUpdatesActive && socketService.isGlobalUpdatesActive(),
    globalNotes,

    // Active users and typing
    activeUsers,
    typingUsers: Array.from(typingUsers.values()),
    getTypingUsers,

    // Current note data
    currentNoteData,

    // Real-time updates
    realtimeUpdates,
    getRecentUpdates: useCallback((limit = 10) => realtimeUpdates.slice(0, limit), [realtimeUpdates]),
    getGlobalUpdates,
    clearRealtimeUpdate: useCallback((updateId) => {
      setRealtimeUpdates(prev => prev.filter(update => update.id !== updateId));
    }, []),
    clearAllRealtimeUpdates: useCallback(() => setRealtimeUpdates([]), []),

    // Note actions
    joinNote,
    leaveNote,

    // Global updates control (NEW)
    enableGlobalUpdates: useCallback(() => toggleGlobalUpdates(true), [toggleGlobalUpdates]),
    disableGlobalUpdates: useCallback(() => toggleGlobalUpdates(false), [toggleGlobalUpdates]),
    toggleGlobalUpdates,

    // Content collaboration
    sendContentChange,
    startTyping: useCallback((noteId, cursorPosition) => socketService.startTyping(noteId, cursorPosition), []),
    stopTyping: useCallback((noteId) => socketService.stopTyping(noteId), []),
    sendCursorPosition: useCallback((noteId, position, selection) => socketService.sendCursorPosition(noteId, position, selection), []),
    requestSync,

    // Connection management
    reconnect: useCallback(() => {
      if (token) {
        console.log('Manual reconnection triggered');
        setConnectionError(null);
        addRealtimeUpdate('connection', 'Reconnecting...', false);

        socketService.disconnect();
        setIsConnected(false);
        setIsGlobalUpdatesActive(false);

        setTimeout(() => {
          socketService.connect(token)
            .then(() => {
              setIsConnected(true);
              addRealtimeUpdate('connection', 'Reconnected successfully', false);

              // Re-enable global updates if they were enabled
              if (enableGlobalUpdates) {
                setTimeout(() => {
                  socketService.enableGlobalUpdates();
                }, 500);
              }
            })
            .catch(error => {
              setConnectionError(error.message);
              addRealtimeUpdate('error', `Reconnection failed: ${error.message}`, true);
            });
        }, 1000);
      }
    }, [token, enableGlobalUpdates, addRealtimeUpdate]),

    getConnectionStatus,

    // Current note info
    currentNoteId: socketService.getCurrentNoteId()
  };
};