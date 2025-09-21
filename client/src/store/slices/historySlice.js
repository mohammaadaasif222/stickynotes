import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const getNoteHistory = createAsyncThunk(
  'noteHistory/getNoteHistory',
  async ({ noteId, params }, thunkAPI) => {
    try {
      const response = await axios.get(`/api/notes/${noteId}/history`, { params });
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getUserActivity = createAsyncThunk(
  'noteHistory/getUserActivity',
  async ({ userId, params }, thunkAPI) => {
    try {
      const response = await axios.get(`/api/users/${userId}/activity`, { params });
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const compareVersions = createAsyncThunk(
  'noteHistory/compareVersions',
  async ({ noteId, fromSequence, toSequence }, thunkAPI) => {
    try {
      const response = await axios.get(`/api/notes/${noteId}/history/compare`, {
        params: { fromSequence, toSequence }
      });
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getHistoryStats = createAsyncThunk(
  'noteHistory/getHistoryStats',
  async ({ noteId }, thunkAPI) => {
    try {
      const response = await axios.get(`/api/notes/${noteId}/history/stats`);
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createHistoryEntry = createAsyncThunk(
  'noteHistory/createHistoryEntry',
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(`/api/history`, payload);
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createNoteHistoryEntry = createAsyncThunk(
  'noteHistory/createNoteHistoryEntry',
  async ({ noteId, payload }, thunkAPI) => {
    try {
      const response = await axios.post(`/api/notes/${noteId}/history`, payload);
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getRecentHistory = createAsyncThunk(
  'noteHistory/getRecentHistory',
  async (params, thunkAPI) => {
    try {
      const response = await axios.get(`/api/history/recent`, { params });
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteHistoryEntry = createAsyncThunk(
  'noteHistory/deleteHistoryEntry',
  async ({ historyId }, thunkAPI) => {
    try {
      const response = await axios.delete(`/api/history/${historyId}`);
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteNoteHistory = createAsyncThunk(
  'noteHistory/deleteNoteHistory',
  async ({ noteId }, thunkAPI) => {
    try {
      const response = await axios.delete(`/api/notes/${noteId}/history`);
      return response.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Initial State
const initialState = {
  history: [],
  activities: [],
  comparison: null,
  stats: {},
  recentHistory: [],
  loading: false,
  error: null,
  pagination: { currentPage: 1, limit: 10, totalCount: 0, totalPages: 0, hasNext: false, hasPrev: false },
  deletedInfo: null
};

// Slice
const noteHistorySlice = createSlice({
  name: 'noteHistory',
  initialState,
  reducers: {
    resetError: state => { state.error = null; },
    resetDeleted: state => { state.deletedInfo = null; }
  },
  extraReducers: builder => {
    builder
      .addCase(getNoteHistory.pending, state => { state.loading = true; state.error = null; })
      .addCase(getNoteHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history;
        state.pagination = action.payload.pagination;
      })
      .addCase(getNoteHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserActivity.pending, state => { state.loading = true; state.error = null; })
      .addCase(getUserActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        // Optionally update pagination here
      })
      .addCase(getUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(compareVersions.pending, state => { state.loading = true; state.error = null; })
      .addCase(compareVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.comparison = action.payload.comparison;
      })
      .addCase(compareVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getHistoryStats.pending, state => { state.loading = true; state.error = null; })
      .addCase(getHistoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getHistoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createHistoryEntry.pending, state => { state.loading = true; state.error = null; })
      .addCase(createHistoryEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.history.unshift(action.payload.historyEntry);
      })
      .addCase(createHistoryEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createNoteHistoryEntry.pending, state => { state.loading = true; state.error = null; })
      .addCase(createNoteHistoryEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.history.unshift(action.payload.historyEntry);
      })
      .addCase(createNoteHistoryEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getRecentHistory.pending, state => { state.loading = true; state.error = null; })
      .addCase(getRecentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.recentHistory = action.payload.recentHistory;
        // Optionally update pagination
      })
      .addCase(getRecentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteHistoryEntry.fulfilled, (state, action) => {
        state.deletedInfo = action.payload;
      })
      .addCase(deleteNoteHistory.fulfilled, (state, action) => {
        state.deletedInfo = action.payload;
        state.history = [];
      })
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  }
});

export const { resetError, resetDeleted } = noteHistorySlice.actions;
export default noteHistorySlice.reducer;
