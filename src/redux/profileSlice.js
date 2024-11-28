import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ROUTES } from '../utils/api';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // First get user profile with type info
      const userProfile = await api.helpers.profile.fetchUserProfile();

      if (userProfile) {
        try {
          // Then get specific profile
          const specificProfile =
            await api.helpers.profile.fetchSpecificProfile(
              userProfile.user_type
            );
          return {
            ...userProfile,
            [`${userProfile.user_type}_profile`]: specificProfile,
          };
        } catch (profileError) {
          // Return just user profile if specific profile doesn't exist yet
          return userProfile;
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const createDeveloperProfile = createAsyncThunk(
  'profile/createDeveloper',
  async (profileData, { rejectWithValue }) => {
    try {
      // Check if profileData is FormData or regular object
      const isFormData = profileData instanceof FormData;
      const config = isFormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        : {};

      const response = await api.post(
        API_ROUTES.PROFILE.DEVELOPER,
        profileData,
        config
      );
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
      return await api.helpers.profile.updateProfile('developer', profileData);
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const createClientProfile = createAsyncThunk(
  'profile/createClient',
  async (profileData, { rejectWithValue }) => {
    try {
      return await api.helpers.profile.createProfile('client', profileData);
    } catch (error) {
      return rejectWithValue(api.helpers.handleError(error));
    }
  }
);

export const updateClientProfile = createAsyncThunk(
  'profile/updateClient',
  async (profileData, { rejectWithValue }) => {
    try {
      return await api.helpers.profile.updateProfile('client', profileData);
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
      })
      .addCase(fetchProfile.rejected, (state, action) => {
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
      });
  },
});

export const { clearProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;
