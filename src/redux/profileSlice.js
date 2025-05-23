import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ROUTES } from '../utils/api';

export const fetchDeveloperProfile = createAsyncThunk(
  'profile/fetchDeveloperProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Use the same helper method we're using for client profiles
      const response = await api.profile.fetchSpecificProfile('developer');
      return response; // Will be null if profile doesn't exist
    } catch (error) {
      console.error('Profile fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchClientProfile = createAsyncThunk(
  'profile/fetchClientProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.profile.fetchSpecificProfile('client');
      // Using the api.profile helper which already handles 404s properly
      return response; // Will be null if profile doesn't exist
    } catch (error) {
      // For any other errors
      console.error('Profile fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);
export const createClientProfile = createAsyncThunk(
  'profile/createClient',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ROUTES.PROFILE.CLIENT, profileData);
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
      const response = await api.post(
        API_ROUTES.PROFILE.DEVELOPER,
        profileData
      );
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
      const response = await api.put(API_ROUTES.PROFILE.CLIENT, profileData);
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
      const response = await api.put(API_ROUTES.PROFILE.DEVELOPER, profileData);
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
    isInitialized: false,
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.isInitialized = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Developer Profile
      .addCase(fetchDeveloperProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Ensure action.payload matches the backend response
        state.isInitialized = true;
      })
      .addCase(fetchDeveloperProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Fetch Client Profile
      .addCase(fetchClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // This will be null for new users
        state.isInitialized = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
        state.data = null;
      })
      // Create Client Profile
      .addCase(createClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          client_profile: action.payload,
        };
      })
      .addCase(createClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Developer Profile
      .addCase(createDeveloperProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeveloperProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          developer_profile: action.payload,
        };
      })
      .addCase(createDeveloperProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Client Profile
      .addCase(updateClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          client_profile: action.payload,
        };
      })
      .addCase(updateClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Developer Profile
      .addCase(updateDeveloperProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeveloperProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = {
          ...state.data,
          developer_profile: action.payload,
        };
      })
      .addCase(updateDeveloperProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile, clearError } = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile.data;
export const selectIsInitialized = (state) => state.profile.isInitialized;
export const selectLoading = (state) => state.profile.loading;
export const selectError = (state) => state.profile.error;

export default profileSlice.reducer;
