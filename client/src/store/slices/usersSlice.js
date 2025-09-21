// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add Authorization header automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks for API calls
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ q, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (q && q.length >= 2) params.q = q;

      const { data } = await API.get('/users', { params });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/users/${userId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async ({ q, limit = 10 }, { rejectWithValue }) => {
    try {
      if (!q || q.length < 2) {
        return rejectWithValue(
          'Search query must be at least 2 characters long'
        );
      }

      const { data } = await API.get('/users/search', {
        params: { q, limit },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search users'
      );
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'users/fetchUserActivity',
  async ({ userId, limit = 20 }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/users/${userId}/activity`, {
        params: { limit },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user activity'
      );
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'users/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/users/dashboard');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/users/${userId}/status`, { isActive });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user status'
      );
    }
  }
);

export const searchPotentialCollaborators = createAsyncThunk(
  'users/searchPotentialCollaborators',
  async ({ q, noteId, limit = 10 }, { rejectWithValue }) => {
    try {
      if (!q || q.length < 2) {
        return rejectWithValue(
          'Search query must be at least 2 characters long'
        );
      }

      const params = { q, limit };
      if (noteId) params.noteId = noteId;

      const { data } = await API.get('/users/collaborators/search', { params });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search collaborators'
      );
    }
  }
);

const initialState = {
  users: [],
  usersPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  usersLoading: false,
  usersError: null,

  currentProfile: null,
  profileLoading: false,
  profileError: null,

  searchResults: [],
  searchLoading: false,
  searchError: null,

  userActivity: [],
  activityLoading: false,
  activityError: null,

  dashboard: {
    statistics: {
      ownedNotes: 0,
      collaborativeNotes: 0,
      totalAccessibleNotes: 0,
    },
    recentNotes: [],
    recentActivity: [],
  },
  dashboardLoading: false,
  dashboardError: null,

  potentialCollaborators: [],
  collaboratorsSearchLoading: false,
  collaboratorsSearchError: null,

  lastSearchQuery: '',
  lastCollaboratorQuery: '',
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.lastSearchQuery = '';
    },
    clearCollaborators: (state) => {
      state.potentialCollaborators = [];
      state.collaboratorsSearchError = null;
      state.lastCollaboratorQuery = '';
    },
    clearUserProfile: (state) => {
      state.currentProfile = null;
      state.profileError = null;
    },
    clearUserActivity: (state) => {
      state.userActivity = [];
      state.activityError = null;
    },
    resetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.data ;
        state.usersPagination =
          action.payload.pagination || initialState.usersPagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || action.error.message;
      })

      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentProfile = action.payload.data;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || action.error.message;
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data;
        state.lastSearchQuery = action.meta.arg.q;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload || action.error.message;
      })

      // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.activityLoading = true;
        state.activityError = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.userActivity = action.payload.data;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.activityLoading = false;
        state.activityError = action.payload || action.error.message;
      })

      // Fetch dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload || action.error.message;
      })

      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (
          state.currentProfile &&
          state.currentProfile._id === action.payload.data._id
        ) {
          state.currentProfile = action.payload.data;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || action.error.message;
      })

      // Search potential collaborators
      .addCase(searchPotentialCollaborators.pending, (state) => {
        state.collaboratorsSearchLoading = true;
        state.collaboratorsSearchError = null;
      })
      .addCase(searchPotentialCollaborators.fulfilled, (state, action) => {
        state.collaboratorsSearchLoading = false;
        state.potentialCollaborators = action.payload.data;
        state.lastCollaboratorQuery = action.meta.arg.q;
      })
      .addCase(searchPotentialCollaborators.rejected, (state, action) => {
        state.collaboratorsSearchLoading = false;
        state.collaboratorsSearchError = action.payload || action.error.message;
      });
  },
});

export const {
  clearSearchResults,
  clearCollaborators,
  clearUserProfile,
  clearUserActivity,
  resetUsersState,
} = userSlice.actions;

export default userSlice.reducer;
