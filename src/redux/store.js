// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import showcaseReducer from './showcaseSlice';
import videoReducer from './videoSlice';
import playlistReducer from './playlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    showcase: showcaseReducer,
    video: videoReducer,
    playlists: playlistReducer, // Added the new playlist reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
      immutableCheck: true,
      thunk: true,
    }).concat(/* any custom middleware */),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;