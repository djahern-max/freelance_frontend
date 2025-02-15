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
    video: videoReducer,
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