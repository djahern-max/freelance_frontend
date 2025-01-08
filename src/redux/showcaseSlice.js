// src/redux/showcaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create showcase
export const createShowcase = createAsyncThunk(
    'showcase/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/project-showcase/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch all showcases
export const fetchShowcases = createAsyncThunk(
    'showcase/fetchAll',
    async ({ skip = 0, limit = 100 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_URL}/project-showcase/?skip=${skip}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch single showcase
export const fetchShowcase = createAsyncThunk(
    'showcase/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_URL}/project-showcase/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update showcase files
export const updateShowcaseFiles = createAsyncThunk(
    'showcase/updateFiles',
    async ({ id, formData }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const userId = state.auth.user?.id;
            const showcase = state.showcase.showcases.find(s => s.id === id);

            if (!showcase || showcase.developer_id !== userId) {
                throw new Error('You do not have permission to update this showcase');
            }

            const response = await axios.put(
                `${API_URL}/project-showcase/${id}/files`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Rate showcase
export const rateShowcase = createAsyncThunk(
    'showcase/rate',
    async ({ id, stars }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/project-showcase/${id}/rating`,
                { stars },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update showcase
export const updateShowcase = createAsyncThunk(
    'showcase/update',
    async ({ id, data }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const userId = state.auth.user?.id;
            const showcase = state.showcase.showcases.find(s => s.id === id);

            if (!showcase || showcase.developer_id !== userId) {
                throw new Error('You do not have permission to edit this showcase');
            }

            const response = await axios.put(
                `${API_URL}/project-showcase/${id}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete showcase
export const deleteShowcase = createAsyncThunk(
    'showcase/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const userId = state.auth.user?.id;
            const showcase = state.showcase.showcases.find(s => s.id === id);

            if (!showcase || showcase.developer_id !== userId) {
                throw new Error('You do not have permission to delete this showcase');
            }

            await axios.delete(`${API_URL}/project-showcase/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const linkProfile = createAsyncThunk(
    'showcase/linkProfile',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/project-showcase/${id}/profile`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            return response.data;
        } catch (error) {
            // Handle different error formats
            const errorMessage = error.response?.data?.detail?.[0]?.msg ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to link profile';
            return rejectWithValue(errorMessage);
        }
    }
);

export const linkVideos = createAsyncThunk(
    'showcase/linkVideos',
    async ({ id, videoIds }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/project-showcase/${id}/videos`,
                videoIds,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.detail?.[0]?.msg ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to link videos';
            return rejectWithValue(errorMessage);
        }
    }
);


const showcaseSlice = createSlice({
    name: 'showcase',
    initialState: {
        showcases: [],
        currentShowcase: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearShowcaseError: (state) => {
            state.error = null;
        },
        clearCurrentShowcase: (state) => {
            state.currentShowcase = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create showcase
            .addCase(createShowcase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createShowcase.fulfilled, (state, action) => {
                state.loading = false;
                state.showcases.unshift(action.payload);
                state.currentShowcase = action.payload;
            })
            .addCase(createShowcase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch showcases
            .addCase(fetchShowcases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShowcases.fulfilled, (state, action) => {
                state.loading = false;
                state.showcases = action.payload;
            })
            .addCase(fetchShowcases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch single showcase
            .addCase(fetchShowcase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShowcase.fulfilled, (state, action) => {
                state.loading = false;
                state.currentShowcase = action.payload;
            })
            .addCase(fetchShowcase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Link profile
            .addCase(linkProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(linkProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentShowcase?.id === action.payload.id) {
                    state.currentShowcase = action.payload;
                }
                const index = state.showcases.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.showcases[index] = action.payload;
                }
            })
            .addCase(linkProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Link videos
            .addCase(linkVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(linkVideos.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentShowcase?.id === action.payload.id) {
                    state.currentShowcase = action.payload;
                }
                const index = state.showcases.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.showcases[index] = action.payload;
                }
            })
            .addCase(linkVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update showcase
            .addCase(updateShowcase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateShowcase.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.showcases.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.showcases[index] = action.payload;
                }
                if (state.currentShowcase?.id === action.payload.id) {
                    state.currentShowcase = action.payload;
                }
            })
            .addCase(updateShowcase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete showcase
            .addCase(deleteShowcase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteShowcase.fulfilled, (state, action) => {
                state.loading = false;
                state.showcases = state.showcases.filter(s => s.id !== action.payload);
                if (state.currentShowcase?.id === action.payload) {
                    state.currentShowcase = null;
                }
            })
            .addCase(deleteShowcase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearShowcaseError, clearCurrentShowcase } = showcaseSlice.actions;

export default showcaseSlice.reducer;