// authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from '../../services/api/authApis';

// Helper function to handle localStorage operations safely
const handleStorage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

// Generic async thunk creator for auth operations
const createAuthThunk = (name, apiCall, options = {}) => {
  return createAsyncThunk(
    `auth/${name}`,
    async (payload, { rejectWithValue }) => {
      try {
        const response = await apiCall(payload);
        
        // Handle different response structures
        const responseData = response.data || response;
        
        // Handle storage operations based on options
        if (options.saveAuth && responseData?.user && responseData?.token) {
          // Store user data with token
          const userData = { ...responseData.user, token: responseData.token };
          handleStorage.set('auth', userData);
          handleStorage.set('userToken', responseData.token);
        }
        
        if (options.saveAdmin && responseData?.admin && responseData?.token) {
          // Store admin data with token
          const adminData = { ...responseData.admin, token: responseData.token };
          handleStorage.set('admin', adminData);
          handleStorage.set('adminToken', responseData.token);
        }
        
        if (options.clearStorage) {
          handleStorage.remove('auth');
          handleStorage.remove('admin');
          handleStorage.remove('userToken');
          handleStorage.remove('adminToken');
        }
        
        return responseData;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'An unexpected error occurred';
        return rejectWithValue(errorMessage);
      }
    }
  );
};

export const loginUser = createAuthThunk(
  'loginUser',
  authApi.login,
  { saveAuth: true }
);
export const adminLoginAsUser = createAuthThunk(
  'adminLoginAsUser',
  authApi.adminLoginAsUser,
  { saveAuth: true }
);

export const loginAdmin = createAuthThunk(
  'loginAdmin',
  (data) => authApi.login({ ...data, isAdmin: true }), // Assuming admin flag
  { saveAdmin: true }
);

export const signupUser = createAuthThunk(
  'signupUser',
  authApi.signup,
  { saveAuth: true }
);

export const forgotPassword = createAuthThunk(
  'forgotPassword',
  authApi.forgot
);

// Logout thunks
export const signoutUser = createAsyncThunk(
  'auth/signoutUser',
  async (_, { rejectWithValue }) => {
    try {
      handleStorage.remove('auth');
      handleStorage.remove('userToken');
      return { message: 'Logged out successfully' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signoutAdmin = createAsyncThunk(
  'auth/signoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      handleStorage.remove('admin');
      handleStorage.remove('adminToken');
      // Add admin logout API call if needed
      // await authApi.adminLogout();
      return { message: 'Admin logged out successfully' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state with localStorage persistence
const getInitialState = () => {
  const savedUser = handleStorage.get('auth');
  const savedAdmin = handleStorage.get('admin');
  const userToken = handleStorage.get('userToken');
  const adminToken = handleStorage.get('adminToken');
  
  return {
    user: savedUser,
    admin: savedAdmin,
    userToken: userToken,
    adminToken: adminToken,
    isAuthenticated: !!(savedUser && userToken),
    isAdminAuthenticated: !!(savedAdmin && adminToken),
    loading: false,
    error: null,
    message: null,
    lastAction: null,
  };
};

// Enhanced auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear message state
    clearMessage: (state) => {
      state.message = null;
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.error = null;
      state.message = null;
    },
    
    // Reset auth state
    resetAuth: (state) => {
      state.user = null;
      state.admin = null;
      state.userToken = null;
      state.adminToken = null;
      state.isAuthenticated = false;
      state.isAdminAuthenticated = false;
      state.error = null;
      state.message = null;
      state.loading = false;
      handleStorage.remove('auth');
      handleStorage.remove('admin');
      handleStorage.remove('userToken');
      handleStorage.remove('adminToken');
    },
    
    // Reset only user auth
    resetUserAuth: (state) => {
      state.user = null;
      state.userToken = null;
      state.isAuthenticated = false;
      handleStorage.remove('auth');
      handleStorage.remove('userToken');
    },
    
    // Reset only admin auth
    resetAdminAuth: (state) => {
      state.admin = null;
      state.adminToken = null;
      state.isAdminAuthenticated = false;
      handleStorage.remove('admin');
      handleStorage.remove('adminToken');
    },
    
    // Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        handleStorage.set('auth', state.user);
      }
    },
    
    // Update admin profile
    updateAdminProfile: (state, action) => {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload };
        handleStorage.set('admin', state.admin);
      }
    },
    
    // Restore auth state from localStorage (useful for app initialization)
    restoreAuthState: (state) => {
      const savedUser = handleStorage.get('auth');
      const savedAdmin = handleStorage.get('admin');
      const userToken = handleStorage.get('userToken');
      const adminToken = handleStorage.get('adminToken');
      
      state.user = savedUser;
      state.admin = savedAdmin;
      state.userToken = userToken;
      state.adminToken = adminToken;
      state.isAuthenticated = !!(savedUser && userToken);
      state.isAdminAuthenticated = !!(savedAdmin && adminToken);
    }
  },
  
  extraReducers: (builder) => {
    // Helper function to create pending, fulfilled, and rejected cases
    const createAsyncCases = (asyncThunk, options = {}) => {
      builder
        .addCase(asyncThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.lastAction = asyncThunk.typePrefix;
        })
        .addCase(asyncThunk.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          
          if (options.setUser && action.payload.user && action.payload.token) {
            state.user = action.payload.user;
            state.userToken = action.payload.token;
            state.isAuthenticated = true;
          }
          
          if (options.setAdmin && action.payload.admin && action.payload.token) {
            state.admin = action.payload.admin;
            state.adminToken = action.payload.token;
            state.isAdminAuthenticated = true;
          }
          
          if (options.clearUser) {
            state.user = null;
            state.userToken = null;
            state.isAuthenticated = false;
          }
          
          if (options.clearAdmin) {
            state.admin = null;
            state.adminToken = null;
            state.isAdminAuthenticated = false;
          }
          
          if (action.payload.message) {
            state.message = action.payload.message;
          }
        })
        .addCase(asyncThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'An error occurred';
        });
    };

    // Apply cases for all auth operations
    createAsyncCases(loginUser, { setUser: true });
    createAsyncCases(adminLoginAsUser, { setUser: true });
    createAsyncCases(loginAdmin, { setAdmin: true });
    createAsyncCases(signupUser, { setUser: true });
    createAsyncCases(forgotPassword);
    createAsyncCases(signoutUser, { clearUser: true });
    createAsyncCases(signoutAdmin, { clearAdmin: true });
  },
});

// Export actions
export const { 
  clearError, 
  clearMessage, 
  clearNotifications, 
  resetAuth,
  resetUserAuth,
  resetAdminAuth,
  updateUserProfile,
  updateAdminProfile,
  restoreAuthState 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAdmin = (state) => state.auth.admin;
export const selectUserToken = (state) => state.auth.userToken;
export const selectAdminToken = (state) => state.auth.adminToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdminAuthenticated = (state) => state.auth.isAdminAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
  
// Helper selector to get the appropriate token based on user type
export const selectCurrentToken = (state, isAdmin = false) => {
  return isAdmin ? state.auth.adminToken : state.auth.userToken;
};

// Helper selector to get current user data (user or admin)
export const selectCurrentUser = (state, isAdmin = false) => {
  return isAdmin ? state.auth.admin : state.auth.user;
};

export default authSlice.reducer;