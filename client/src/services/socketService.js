// // src/services/socketService.js
// import { io } from 'socket.io-client';
// import toast from 'react-hot-toast';

// class SocketService {
//   constructor() {
//     this.socket = null;
//     this.isConnected = false;
//     this.currentNoteId = null;
//     this.listeners = new Map();
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//     this.reconnectDelay = 1000;
//     this.connectionPromise = null;
//   }

//   connect(token) {
//     // Prevent multiple simultaneous connection attempts
//     if (this.connectionPromise) {
//       console.log('Connection already in progress...');
//       return this.connectionPromise;
//     }

//     if (this.socket && this.isConnected) {
//       console.log('Socket already connected');
//       return Promise.resolve();
//     }

//     this.connectionPromise = new Promise((resolve, reject) => {
//       console.log('Connecting to socket server...');
      
//       // Use environment variable or fallback to localhost
//       const serverURL ='http://localhost:5000';
//       console.log('Connecting to:', serverURL);
      
//       // Disconnect existing socket if any
//       if (this.socket) {
//         this.socket.disconnect();
//         this.socket = null;
//       }

//       // Clean token - ensure it doesn't have Bearer prefix for socket auth
//       let cleanToken = token;
//       if (cleanToken && cleanToken.startsWith('Bearer ')) {
//         cleanToken = cleanToken.substring(7);
//       }

//       console.log('Using token for socket auth (first 10 chars):', cleanToken ? cleanToken.substring(0, 10) + '...' : 'No token');

//       this.socket = io(serverURL, {
//         auth: { 
//           token: cleanToken
//         },
//         transports: ['websocket', 'polling'],
//         timeout: 20000,
//         forceNew: true,
//         autoConnect: true,
//         reconnection: true,
//         reconnectionDelay: this.reconnectDelay,
//         reconnectionAttempts: this.maxReconnectAttempts,
//         reconnectionDelayMax: 5000,
//         maxReconnectionAttempts: this.maxReconnectAttempts,
//         // Additional connection options
//         withCredentials: true,
//         upgrade: true
//       });

//       this.setupEventListeners(resolve, reject);
//     });

//     return this.connectionPromise;
//   }

//   disconnect() {
//     console.log('Disconnecting socket...');
//     this.connectionPromise = null;
    
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.isConnected = false;
//       this.currentNoteId = null;
//     }
//     this.listeners.clear();
//     this.reconnectAttempts = 0;
//   }

//   setupEventListeners(resolve, reject) {
//     if (!this.socket) return;

//     let resolved = false;

//     // Connection success
//     this.socket.on('connect', () => {
//       console.log('Socket connected successfully with ID:', this.socket.id);
//       this.isConnected = true;
//       this.reconnectAttempts = 0;
//       this.connectionPromise = null;
//       this.emit('socket-connected', { isConnected: true });
      
//       if (!resolved) {
//         resolved = true;
//         resolve();
//       }
//     });

//     // Server confirmation
//     this.socket.on('connected', (data) => {
//       console.log('Server confirmed connection:', data);
//       toast.success('Connected to real-time updates');
//     });

//     // Connection error
//     this.socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error.message);
//       this.isConnected = false;
//       this.reconnectAttempts++;
      
//       // Handle authentication errors specifically
//       if (error.message && error.message.includes('Authentication error')) {
//         console.error('Authentication failed:', error.message);
//         toast.error('Authentication failed. Please log in again.');
//         this.connectionPromise = null;
        
//         if (!resolved) {
//           resolved = true;
//           reject(new Error('Authentication failed: ' + error.message));
//         }
//         return;
//       }
      
//       if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.error('Max reconnection attempts reached');
//         toast.error('Failed to connect to real-time updates');
//         this.connectionPromise = null;
        
//         if (!resolved) {
//           resolved = true;
//           reject(error);
//         }
//       } else {
//         console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
//         toast.loading(`Connecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
//           id: 'reconnecting'
//         });
//       }
//     });

//     // Disconnection
//     this.socket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//       this.isConnected = false;
//       toast.dismiss('reconnecting');
//       this.emit('socket-disconnected', { reason });
      
//       // Handle different disconnect reasons
//       if (reason === 'io server disconnect') {
//         toast.error('Server disconnected. Attempting to reconnect...');
//         setTimeout(() => this.reconnect(), this.reconnectDelay);
//       } else if (reason === 'io client disconnect') {
//         // Client initiated disconnect - don't reconnect automatically
//         console.log('Client disconnected intentionally');
//       } else {
//         // Other reasons - attempt to reconnect
//         console.log('Unexpected disconnect, will attempt to reconnect');
//       }
//     });

//     // Note events
//     this.socket.on('note-joined', (data) => {
//       console.log('Successfully joined note:', data.noteId);
//       this.currentNoteId = data.noteId;
//       this.emit('note-joined', data);
//     });

//     this.socket.on('note-left', (data) => {
//       console.log('Left note:', data.noteId);
//       if (this.currentNoteId === data.noteId) {
//         this.currentNoteId = null;
//       }
//       this.emit('note-left', data);
//     });

//     this.socket.on('note-updated', (data) => {
//       console.log('Note updated:', data.noteId);
//       this.emit('note-updated', data);
//     });

//     this.socket.on('note-deleted', (data) => {
//       console.log('Note deleted:', data.noteId);
//       this.emit('note-deleted', data);
//       if (this.currentNoteId === data.noteId) {
//         toast.error('This note has been deleted');
//         this.currentNoteId = null;
//       }
//     });

//     // Real-time collaboration events
//     this.socket.on('content-changed', (data) => {
//       console.log('Content changed by user:', data.userId);
//       this.emit('content-changed', data);
//     });

//     this.socket.on('user-joined', (data) => {
//       console.log('User joined note:', data.user.firstName || data.user.username);
//       this.emit('user-joined', data);
//       toast.success(`${data.user.firstName || data.user.username} joined the note`);
//     });

//     this.socket.on('user-left', (data) => {
//       console.log('User left note');
//       this.emit('user-left', data);
//     });

//     this.socket.on('user-typing-start', (data) => {
//       this.emit('user-typing-start', data);
//     });

//     this.socket.on('user-typing-stop', (data) => {
//       this.emit('user-typing-stop', data);
//     });

//     this.socket.on('user-cursor-position', (data) => {
//       this.emit('user-cursor-position', data);
//     });

//     // Auto-save events
//     this.socket.on('auto-saved', (data) => {
//       console.log('Auto-saved note:', data.noteId);
//       this.emit('auto-saved', data);
//     });

//     this.socket.on('save-error', (data) => {
//       console.error('Save error:', data);
//       this.emit('save-error', data);
//       toast.error('Failed to save changes');
//     });

//     // Sync events
//     this.socket.on('sync-response', (data) => {
//       console.log('Sync response received');
//       this.emit('sync-response', data);
//     });

//     // Error events
//     this.socket.on('error', (data) => {
//       console.error('Socket error:', data);
//       this.emit('socket-error', data);
//       toast.error(data.message || 'An error occurred');
//     });

//     this.socket.on('force-disconnect', (data) => {
//       console.log('Force disconnect:', data.reason);
//       toast.error(data.reason || 'Disconnected by server');
//       this.emit('force-disconnect', data);
//     });

//     // Timeout for initial connection
//     setTimeout(() => {
//       if (!resolved && !this.isConnected) {
//         resolved = true;
//         reject(new Error('Connection timeout'));
//       }
//     }, 30000); // 30 second timeout
//   }

//   // Reconnection method
//   reconnect() {
//     if (this.isConnected || this.connectionPromise) return;
    
//     console.log('Attempting to reconnect...');
//     const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//     if (token) {
//       this.connect(token).catch(error => {
//         console.error('Reconnection failed:', error);
//       });
//     } else {
//       console.error('No token available for reconnection');
//     }
//   }

//   // Join a note room
//   joinNote(noteId) {
//     if (!this.socket || !this.isConnected) {
//       console.warn('Cannot join note: socket not connected');
//       toast.error('Not connected to server. Please refresh the page.');
//       return false;
//     }
    
//     console.log('Joining note:', noteId);
//     this.socket.emit('join-note', { noteId });
//     return true;
//   }

//   // Leave a note room
//   leaveNote(noteId) {
//     if (!this.socket || !this.isConnected) {
//       return false;
//     }
    
//     console.log('Leaving note:', noteId);
//     this.socket.emit('leave-note', { noteId });
//     if (this.currentNoteId === noteId) {
//       this.currentNoteId = null;
//     }
//     return true;
//   }

//   // Send typing start event
//   startTyping(noteId, cursorPosition) {
//     if (this.socket && this.isConnected && this.currentNoteId === noteId) {
//       this.socket.emit('typing-start', { noteId, cursorPosition });
//       return true;
//     }
//     return false;
//   }

//   // Send typing stop event
//   stopTyping(noteId) {
//     if (this.socket && this.isConnected && this.currentNoteId === noteId) {
//       this.socket.emit('typing-stop', { noteId });
//       return true;
//     }
//     return false;
//   }

//   // Send cursor position
//   sendCursorPosition(noteId, position, selection) {
//     if (this.socket && this.isConnected && this.currentNoteId === noteId) {
//       this.socket.emit('cursor-position', { noteId, position, selection });
//       return true;
//     }
//     return false;
//   }

//   // Send content change
//   sendContentChange(noteId, content, operation, position, length) {
//     if (this.socket && this.isConnected && this.currentNoteId === noteId) {
//       console.log('Sending content change:', { noteId, operation, position, length });
//       this.socket.emit('content-change', {
//         noteId,
//         content,
//         operation,
//         position,
//         length,
//         timestamp: Date.now()
//       });
//       return true;
//     } else {
//       console.warn('Cannot send content change: socket not connected or not in note');
//       return false;
//     }
//   }

//   // Request sync
//   requestSync(noteId, clientVersion) {
//     if (this.socket && this.isConnected) {
//       console.log('Requesting sync for note:', noteId);
//       this.socket.emit('request-sync', { noteId, clientVersion });
//       return true;
//     }
//     return false;
//   }

//   // Event listener management
//   on(event, callback) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, new Set());
//     }
//     this.listeners.get(event).add(callback);
//   }

//   off(event, callback) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).delete(callback);
//       if (this.listeners.get(event).size === 0) {
//         this.listeners.delete(event);
//       }
//     }
//   }

//   emit(event, data) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).forEach(callback => {
//         try {
//           callback(data);
//         } catch (error) {
//           console.error(`Error in socket event listener for ${event}:`, error);
//         }
//       });
//     }
//   }

//   // Get connection status
//   isSocketConnected() {
//     return this.isConnected && this.socket?.connected;
//   }

//   // Get current note ID
//   getCurrentNoteId() {
//     return this.currentNoteId;
//   }

//   // Get socket instance (for debugging)
//   getSocket() {
//     return this.socket;
//   }

//   // Test connection method
//   testConnection() {
//     if (this.socket && this.isConnected) {
//       console.log('Testing socket connection...');
//       this.socket.emit('test-connection', { timestamp: Date.now() });
//       return true;
//     }
//     return false;
//   }
// }

// // Create singleton instance
// const socketService = new SocketService();

// export default socketService;


// src/services/socketService.js
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentNoteId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connectionPromise = null;
    this.isGlobalUpdatesEnabled = false;
  }

  connect(token) {
    // Prevent multiple simultaneous connection attempts
    if (this.connectionPromise) {
      console.log('Connection already in progress...');
      return this.connectionPromise;
    }

    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('Connecting to socket server...');
      
      // Use environment variable or fallback to localhost
      const serverURL ='http://localhost:5000';
      console.log('Connecting to:', serverURL);
      
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Clean token - ensure it doesn't have Bearer prefix for socket auth
      let cleanToken = token;
      if (cleanToken && cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.substring(7);
      }

      console.log('Using token for socket auth (first 10 chars):', cleanToken ? cleanToken.substring(0, 10) + '...' : 'No token');

      this.socket = io(serverURL, {
        auth: { 
          token: cleanToken
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
        // Additional connection options
        withCredentials: true,
        upgrade: true
      });

      this.setupEventListeners(resolve, reject);
    });

    return this.connectionPromise;
  }

  disconnect() {
    console.log('Disconnecting socket...');
    this.connectionPromise = null;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentNoteId = null;
      this.isGlobalUpdatesEnabled = false;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  setupEventListeners(resolve, reject) {
    if (!this.socket) return;

    let resolved = false;

    // Connection success
    this.socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionPromise = null;
      this.emit('socket-connected', { isConnected: true });
      
      // Auto-join global updates on connection
      this.enableGlobalUpdates();
      
      if (!resolved) {
        resolved = true;
        resolve();
      }
    });

    // Server confirmation
    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
      toast.success('Connected to real-time updates');
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      // Handle authentication errors specifically
      if (error.message && error.message.includes('Authentication error')) {
        console.error('Authentication failed:', error.message);
        toast.error('Authentication failed. Please log in again.');
        this.connectionPromise = null;
        
        if (!resolved) {
          resolved = true;
          reject(new Error('Authentication failed: ' + error.message));
        }
        return;
      }
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        toast.error('Failed to connect to real-time updates');
        this.connectionPromise = null;
        
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      } else {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        toast.loading(`Connecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
          id: 'reconnecting'
        });
      }
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.isGlobalUpdatesEnabled = false;
      toast.dismiss('reconnecting');
      this.emit('socket-disconnected', { reason });
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        toast.error('Server disconnected. Attempting to reconnect...');
        setTimeout(() => this.reconnect(), this.reconnectDelay);
      } else if (reason === 'io client disconnect') {
        // Client initiated disconnect - don't reconnect automatically
        console.log('Client disconnected intentionally');
      } else {
        // Other reasons - attempt to reconnect
        console.log('Unexpected disconnect, will attempt to reconnect');
      }
    });

    // Note events
    this.socket.on('note-joined', (data) => {
      console.log('Successfully joined note:', data.noteId);
      this.currentNoteId = data.noteId;
      this.emit('note-joined', data);
    });

    this.socket.on('note-left', (data) => {
      console.log('Left note:', data.noteId);
      if (this.currentNoteId === data.noteId) {
        this.currentNoteId = null;
      }
      this.emit('note-left', data);
    });

    this.socket.on('note-updated', (data) => {
      console.log('Note updated:', data.noteId);
      this.emit('note-updated', data);
    });

    this.socket.on('note-deleted', (data) => {
      console.log('Note deleted:', data.noteId);
      this.emit('note-deleted', data);
      if (this.currentNoteId === data.noteId) {
        toast.error('This note has been deleted');
        this.currentNoteId = null;
      }
    });

    // Real-time collaboration events
    this.socket.on('content-changed', (data) => {
      console.log('Content changed by user:', data.userId);
      this.emit('content-changed', data);
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined note:', data.user.firstName || data.user.username);
      this.emit('user-joined', data);
      toast.success(`${data.user.firstName || data.user.username} joined the note`);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left note');
      this.emit('user-left', data);
    });

    this.socket.on('user-typing-start', (data) => {
      this.emit('user-typing-start', data);
    });

    this.socket.on('user-typing-stop', (data) => {
      this.emit('user-typing-stop', data);
    });

    this.socket.on('user-cursor-position', (data) => {
      this.emit('user-cursor-position', data);
    });

    // Auto-save events
    this.socket.on('auto-saved', (data) => {
      console.log('Auto-saved note:', data.noteId);
      this.emit('auto-saved', data);
    });

    this.socket.on('save-error', (data) => {
      console.error('Save error:', data);
      this.emit('save-error', data);
      toast.error('Failed to save changes');
    });

    // Sync events
    this.socket.on('sync-response', (data) => {
      console.log('Sync response received');
      this.emit('sync-response', data);
    });

    // Global note events (NEW)
    this.socket.on('global-updates-joined', (data) => {
      console.log('Joined global updates:', data);
      this.isGlobalUpdatesEnabled = true;
      this.emit('global-updates-joined', data);
    });

    this.socket.on('global-updates-left', (data) => {
      console.log('Left global updates:', data);
      this.isGlobalUpdatesEnabled = false;
      this.emit('global-updates-left', data);
    });

    this.socket.on('public-note-created', (data) => {
      console.log('New public note created:', data.note.title);
      this.emit('public-note-created', data);
      
      // Show toast notification with creator info
      const creatorName = data.creator.firstName || data.creator.username;
      toast.success(`${creatorName} created a new public note: "${data.note.title}"`, {
        duration: 5000,
        icon: '📝'
      });
    });

    this.socket.on('public-note-updated', (data) => {
      console.log('Public note updated:', data.note.title);
      this.emit('public-note-updated', data);
      
      // Show different notifications based on what changed
      const updaterName = data.updater.firstName || data.updater.username;
      if (data.changes.isPublic?.new === true) {
        toast.success(`${updaterName} made "${data.note.title}" public`, {
          duration: 4000,
          icon: '🌐'
        });
      } else if (data.changes.title) {
        toast.success(`${updaterName} updated public note: "${data.note.title}"`, {
          duration: 3000,
          icon: '✏️'
        });
      }
    });

    this.socket.on('public-note-privatized', (data) => {
      console.log('Public note became private:', data.title);
      this.emit('public-note-privatized', data);
      toast(`"${data.title}" is no longer public`, {
        duration: 3000,
        icon: '🔒'
      });
    });

    this.socket.on('public-note-deleted', (data) => {
      console.log('Public note deleted:', data.title);
      this.emit('public-note-deleted', data);
      
      const deleterName = data.deleter.firstName || data.deleter.username;
      toast(`${deleterName} deleted public note: "${data.title}"`, {
        duration: 4000,
        icon: '🗑️'
      });
    });

    // Error events
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('socket-error', data);
      toast.error(data.message || 'An error occurred');
    });

    this.socket.on('force-disconnect', (data) => {
      console.log('Force disconnect:', data.reason);
      toast.error(data.reason || 'Disconnected by server');
      this.emit('force-disconnect', data);
    });

    // Timeout for initial connection
    setTimeout(() => {
      if (!resolved && !this.isConnected) {
        resolved = true;
        reject(new Error('Connection timeout'));
      }
    }, 30000); // 30 second timeout
  }

  // Reconnection method
  reconnect() {
    if (this.isConnected || this.connectionPromise) return;
    
    console.log('Attempting to reconnect...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      this.connect(token).catch(error => {
        console.error('Reconnection failed:', error);
      });
    } else {
      console.error('No token available for reconnection');
    }
  }

  // Global updates management (NEW)
  enableGlobalUpdates() {
    if (this.socket && this.isConnected && !this.isGlobalUpdatesEnabled) {
      console.log('Enabling global updates...');
      this.socket.emit('join-global-updates');
      return true;
    }
    return false;
  }

  disableGlobalUpdates() {
    if (this.socket && this.isConnected && this.isGlobalUpdatesEnabled) {
      console.log('Disabling global updates...');
      this.socket.emit('leave-global-updates');
      return true;
    }
    return false;
  }

  // Join a note room
  joinNote(noteId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot join note: socket not connected');
      toast.error('Not connected to server. Please refresh the page.');
      return false;
    }
    
    console.log('Joining note:', noteId);
    this.socket.emit('join-note', { noteId });
    return true;
  }

  // Leave a note room
  leaveNote(noteId) {
    if (!this.socket || !this.isConnected) {
      return false;
    }
    
    console.log('Leaving note:', noteId);
    this.socket.emit('leave-note', { noteId });
    if (this.currentNoteId === noteId) {
      this.currentNoteId = null;
    }
    return true;
  }

  // Send typing start event
  startTyping(noteId, cursorPosition) {
    if (this.socket && this.isConnected && this.currentNoteId === noteId) {
      this.socket.emit('typing-start', { noteId, cursorPosition });
      return true;
    }
    return false;
  }

  // Send typing stop event
  stopTyping(noteId) {
    if (this.socket && this.isConnected && this.currentNoteId === noteId) {
      this.socket.emit('typing-stop', { noteId });
      return true;
    }
    return false;
  }

  // Send cursor position
  sendCursorPosition(noteId, position, selection) {
    if (this.socket && this.isConnected && this.currentNoteId === noteId) {
      this.socket.emit('cursor-position', { noteId, position, selection });
      return true;
    }
    return false;
  }

  // Send content change
  sendContentChange(noteId, content, operation, position, length) {
    if (this.socket && this.isConnected && this.currentNoteId === noteId) {
      console.log('Sending content change:', { noteId, operation, position, length });
      this.socket.emit('content-change', {
        noteId,
        content,
        operation,
        position,
        length,
        timestamp: Date.now()
      });
      return true;
    } else {
      console.warn('Cannot send content change: socket not connected or not in note');
      return false;
    }
  }

  // Request sync
  requestSync(noteId, clientVersion) {
    if (this.socket && this.isConnected) {
      console.log('Requesting sync for note:', noteId);
      this.socket.emit('request-sync', { noteId, clientVersion });
      return true;
    }
    return false;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get current note ID
  getCurrentNoteId() {
    return this.currentNoteId;
  }

  // Get global updates status
  isGlobalUpdatesActive() {
    return this.isGlobalUpdatesEnabled;
  }

  // Get socket instance (for debugging)
  getSocket() {
    return this.socket;
  }

  // Test connection method
  testConnection() {
    if (this.socket && this.isConnected) {
      console.log('Testing socket connection...');
      this.socket.emit('test-connection', { timestamp: Date.now() });
      return true;
    }
    return false;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;