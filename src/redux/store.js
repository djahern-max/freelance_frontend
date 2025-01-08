// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import showcaseReducer from './showcaseSlice';
import videoReducer from './videoSlice';  // Changed from videosSlice to videoSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    showcase: showcaseReducer,
    video: videoReducer,    // Changed from videos to video
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'showcase/create/fulfilled',
          'showcase/updateFiles/fulfilled',
          'showcase/create/pending'
        ],
        ignoredActionPaths: [
          'payload.formData',
          'meta.arg.formData',
          'meta.arg'
        ],
        ignoredPaths: [],
      },
    }),
});

export default store;