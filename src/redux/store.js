import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import showcaseReducer from './showcaseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    showcase: showcaseReducer,
  },
});

export default store;