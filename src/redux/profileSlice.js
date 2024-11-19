import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profile/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const createDeveloperProfile = createAsyncThunk(
  'profile/createDeveloper',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post('/profile/developer', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const updateDeveloperProfile = createAsyncThunk(
  'profile/updateDeveloper',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/developer', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const createClientProfile = createAsyncThunk(
  'profile/createClient',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post('/profile/client', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const updateClientProfile = createAsyncThunk(
  'profile/updateClient',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile/client', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create/Update Developer Profile
      .addCase(createDeveloperProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeveloperProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createDeveloperProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // Handle other cases similarly...
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
