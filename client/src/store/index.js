// store/index.js - Updated version for your existing store
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import notesReducer from "./slices/noteSlice";
import historyReducer from "./slices/historySlice";

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  notes: notesReducer,
  history:historyReducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/PAUSE',
          'persist/FLUSH',
        ],
      },
    }) // Add this line
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export const persistor = persistStore(store);