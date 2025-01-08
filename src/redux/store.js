// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import showcaseReducer from './showcaseSlice';
// Import other reducers...

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    showcase: showcaseReducer,
    // Add other reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['showcase/create/fulfilled', 'showcase/updateFiles/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.formData', 'meta.arg.formData'],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
});

export default store;