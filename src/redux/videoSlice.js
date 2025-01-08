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

const videoSlice = createSlice({
    name: 'video',
    initialState: {
        videos: [],
        loading: false,
        error: null
    },
    reducers: {
        clearVideoError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
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
            });
    }
});

export const { clearVideoError } = videoSlice.actions;
export default videoSlice.reducer;