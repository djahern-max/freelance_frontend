import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ROUTES } from '../utils/api';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await api.profile.fetchUserProfile();

      if (!userProfile) {
        return null;
      }

      return {
        ...userProfile,
        [`${userProfile.user_type}_profile`]: null,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(api.helpers.handleError(error));
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
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
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
