// src/store/slices/notesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/api/client";
import toast from "react-hot-toast";
import { BASEURL } from "../../baseurl";

const API_BASE_URL = `${BASEURL}/notes`; 

export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { searchQuery, sortBy, sortOrder } = getState().notes;
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        sortBy,
        sortOrder,
        limit: 50,
      });
      const response = await apiClient.get(`${API_BASE_URL}?${params}`);
      return response.data.data;
    } catch (error) {
      toast.error("Failed to fetch notes");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single note
export const fetchNote = createAsyncThunk(
  "notes/fetchNote",
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/${noteId}`);
      return response.data.data;
    } catch (error) {
      toast.error("Failed to fetch note");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create note
export const createNote = createAsyncThunk(
  "notes/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_BASE_URL, noteData);
      toast.success("Note created successfully!");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to create note");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update note
export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ noteId, noteData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`${API_BASE_URL}/${noteId}`, noteData);
      toast.success("Note updated successfully!");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to update note");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete note
export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (noteId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${noteId}`);
      toast.success("Note deleted successfully!");
      return noteId;
    } catch (error) {
      toast.error("Failed to delete note");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update note content (autosave)
export const updateNoteContent = createAsyncThunk(
  "notes/updateNoteContent",
  async ({ noteId, content }, { rejectWithValue }) => {
    try {
      await apiClient.patch(`${API_BASE_URL}/${noteId}/content`, {
        content,
        isAutoSave: true,
      });
      return { noteId, content };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add collaborator
export const addCollaborator = createAsyncThunk(
  "notes/addCollaborator",
  async ({ noteId, userId, role = "read-only" }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/${noteId}/collaborators`,
        { userId, role }
      );
      toast.success("Collaborator added successfully!");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to add collaborator");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Remove collaborator
export const removeCollaborator = createAsyncThunk(
  "notes/removeCollaborator",
  async ({ noteId, userId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${noteId}/collaborators`, {
        data: { userId },
      });
      toast.success("Collaborator removed successfully!");
      return { noteId, userId };
    } catch (error) {
      toast.error("Failed to remove collaborator");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch note history
export const fetchNoteHistory = createAsyncThunk(
  "notes/fetchNoteHistory",
  async ({ noteId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/${noteId}/history?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      toast.error("Failed to fetch note history");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------- Slice ------------

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    notes: [],
    currentNote: null,
    isLoading: false,
    searchQuery: "",
    sortBy: "updatedAt",
    sortOrder: "desc",
    error: null,
    history: [],
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
    updateNoteFromSocket: (state, action) => {
      const updatedNote = action.payload;
      state.notes = state.notes.map((note) =>
        note._id === updatedNote._id ? { ...note, ...updatedNote } : note
      );
      if (state.currentNote?._id === updatedNote._id) {
        state.currentNote = { ...state.currentNote, ...updatedNote };
      }
    },
    removeNoteFromSocket: (state, action) => {
      const noteId = action.payload;
      state.notes = state.notes.filter((note) => note._id !== noteId);
      if (state.currentNote?._id === noteId) {
        state.currentNote = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchNote.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.notes = state.notes.map((note) =>
          note._id === action.payload._id ? action.payload : note
        );
        if (state.currentNote?._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note._id !== action.payload);
        if (state.currentNote?._id === action.payload) {
          state.currentNote = null;
        }
      })
      .addCase(updateNoteContent.fulfilled, (state, action) => {
        const { noteId, content } = action.payload;
        state.notes = state.notes.map((note) =>
          note._id === noteId ? { ...note, content } : note
        );
        if (state.currentNote?._id === noteId) {
          state.currentNote.content = content;
        }
      })
      .addCase(fetchNoteHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setSortOptions,
  clearCurrentNote,
  updateNoteFromSocket,
  removeNoteFromSocket,
} = notesSlice.actions;

export default notesSlice.reducer;
