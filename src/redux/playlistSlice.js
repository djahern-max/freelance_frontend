// src/redux/playlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../utils/apiService';

export const fetchUserPlaylists = createAsyncThunk(
    'playlists/fetchUserPlaylists',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await apiService.get(`/playlists/user/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPlaylistDetails = createAsyncThunk(
    'playlists/fetchPlaylistDetails',
    async (playlistId, { rejectWithValue }) => {
        try {
            const response = await apiService.get(`/playlists/${playlistId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createPlaylist = createAsyncThunk(
    'playlists/createPlaylist',
    async (playlistData, { rejectWithValue }) => {
        try {
            const response = await apiService.post('/playlists/', playlistData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updatePlaylist = createAsyncThunk(
    'playlists/updatePlaylist',
    async ({ playlistId, playlistData }, { rejectWithValue }) => {
        try {
            const response = await apiService.put(`/playlists/${playlistId}`, playlistData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const addVideoToPlaylist = createAsyncThunk(
    'playlists/addVideoToPlaylist',
    async ({ playlistId, videoId, order }, { dispatch, getState, rejectWithValue }) => {
        try {
            console.log('Adding video to playlist:', { playlistId, videoId, order });
            const url = order
                ? `/playlists/${playlistId}/videos/${videoId}?order=${order}`
                : `/playlists/${playlistId}/videos/${videoId}`;

            const response = await apiService.post(url);
            console.log('Add to playlist response:', response);

            // After successful addition, refresh the playlists
            // Get userId from the auth state instead of using a non-existent helper
            const userId = getState().auth.user?.id;

            // Only dispatch if we have a userId
            if (userId) {
                dispatch(fetchUserPlaylists(userId));
            }

            return response.data;
        } catch (error) {
            console.error('Error adding to playlist:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deletePlaylist = createAsyncThunk(
    'playlists/deletePlaylist',
    async (playlistId, { dispatch, rejectWithValue }) => {
        try {
            await apiService.delete(`/playlists/${playlistId}`);
            return playlistId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchVideoPlaylists = createAsyncThunk(
    'playlists/fetchVideoPlaylists',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await apiService.get(`/playlists/video/${videoId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const playlistSlice = createSlice({
    name: 'playlists',
    initialState: {
        userPlaylists: [],
        videoPlaylists: [], // Add this new property
        currentPlaylist: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch user playlists
            .addCase(fetchUserPlaylists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
                state.loading = false;
                state.userPlaylists = action.payload;
            })
            .addCase(fetchUserPlaylists.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch playlist details
            .addCase(fetchPlaylistDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlaylistDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlaylist = action.payload;
            })
            .addCase(fetchPlaylistDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create playlist
            .addCase(createPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPlaylist.fulfilled, (state, action) => {
                state.loading = false;
                state.userPlaylists.push(action.payload);
            })
            .addCase(createPlaylist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update playlist
            .addCase(updatePlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePlaylist.fulfilled, (state, action) => {
                state.loading = false;
                // Update in userPlaylists array
                const index = state.userPlaylists.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.userPlaylists[index] = action.payload;
                }
                // Update currentPlaylist if it matches
                if (state.currentPlaylist && state.currentPlaylist.id === action.payload.id) {
                    state.currentPlaylist = {
                        ...state.currentPlaylist,
                        ...action.payload,
                        // Preserve videos array from currentPlaylist if it exists
                        videos: state.currentPlaylist.videos || []
                    };
                }
            })
            .addCase(updatePlaylist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add video to playlist (no state update needed as we'll refetch)
            .addCase(addVideoToPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addVideoToPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addVideoToPlaylist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deletePlaylist.fulfilled, (state, action) => {
                state.userPlaylists = state.userPlaylists.filter(
                    playlist => playlist.id !== action.payload
                );
            })
            .addCase(fetchVideoPlaylists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideoPlaylists.fulfilled, (state, action) => {
                state.loading = false;
                state.videoPlaylists = action.payload;
            })
            .addCase(fetchVideoPlaylists.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default playlistSlice.reducer;