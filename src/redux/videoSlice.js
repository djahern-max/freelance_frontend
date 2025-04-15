// src/redux/videoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchUserVideos = createAsyncThunk(
    'video/fetchUserVideos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/video_display/my-videos');
            return response.data.videos || []; // Extract videos array from response
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateVideo = createAsyncThunk(
    'video/updateVideo',
    async ({ videoId, videoData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/videos/${videoId}`, videoData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

export const deleteVideo = createAsyncThunk(
    'video/deleteVideo',
    async (videoId, { rejectWithValue }) => {
        try {
            await api.delete(`/videos/${videoId}`);
            return videoId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message);
        }
    }
);

const videoSlice = createSlice({
    name: 'video',
    initialState: {
        videos: [],
        currentVideo: null,
        loading: false,
        error: null
    },
    reducers: {
        clearVideoError: (state) => {
            state.error = null;
        },
        setCurrentVideo: (state, action) => {
            state.currentVideo = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch user videos
            .addCase(fetchUserVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserVideos.fulfilled, (state, action) => {
                state.loading = false;
                state.videos = action.payload;
            })
            .addCase(fetchUserVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.videos = [];
            })

            // Update video
            .addCase(updateVideo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVideo.fulfilled, (state, action) => {
                state.loading = false;
                // Update in videos array
                const index = state.videos.findIndex(v => v.id === action.payload.id);
                if (index !== -1) {
                    state.videos[index] = action.payload;
                }
                // Update currentVideo if it matches
                if (state.currentVideo && state.currentVideo.id === action.payload.id) {
                    state.currentVideo = action.payload;
                }
            })
            .addCase(updateVideo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete video
            .addCase(deleteVideo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVideo.fulfilled, (state, action) => {
                state.loading = false;
                state.videos = state.videos.filter(video => video.id !== action.payload);
                if (state.currentVideo && state.currentVideo.id === action.payload) {
                    state.currentVideo = null;
                }
            })
            .addCase(deleteVideo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearVideoError, setCurrentVideo } = videoSlice.actions;
export default videoSlice.reducer;