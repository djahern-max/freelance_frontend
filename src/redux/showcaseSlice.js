// src/redux/showcaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const createShowcase = createAsyncThunk(
    'showcase/create',
    async (formData) => {
        const response = await axios.post(`${API_URL}/project-showcase/`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return response.data;
    }
);

export const fetchShowcases = createAsyncThunk(
    'showcase/fetchAll',
    async ({ skip = 0, limit = 100 }) => {
        const response = await axios.get(
            `${API_URL}/project-showcase/?skip=${skip}&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            }
        );
        return response.data;
    }
);

export const fetchShowcase = createAsyncThunk(
    'showcase/fetchOne',
    async (id) => {
        const response = await axios.get(`${API_URL}/project-showcase/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return response.data;
    }
);

export const updateShowcase = createAsyncThunk(
    'showcase/update',
    async ({ id, data }) => {
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
    }
);

export const updateShowcaseFiles = createAsyncThunk(
    'showcase/updateFiles',
    async ({ id, formData }) => {
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
    }
);

export const rateShowcase = createAsyncThunk(
    'showcase/rate',
    async ({ id, stars }) => {
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
    }
);

export const deleteShowcase = createAsyncThunk(
    'showcase/delete',
    async (id) => {
        await axios.delete(`${API_URL}/project-showcase/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return id;
    }
);

const showcaseSlice = createSlice({
    name: 'showcase',
    initialState: {
        showcases: [],
        currentShowcase: null,
        loading: false,
        error: null,
        totalCount: 0,
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
                state.error = action.error.message;
            })

            // Fetch all showcases
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
                state.error = action.error.message;
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
                state.error = action.error.message;
            })

            // Update showcase
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

            // Delete showcase
            .addCase(deleteShowcase.fulfilled, (state, action) => {
                state.showcases = state.showcases.filter(s => s.id !== action.payload);
                if (state.currentShowcase?.id === action.payload) {
                    state.currentShowcase = null;
                }
            });
    },
});

export const { clearShowcaseError, clearCurrentShowcase } = showcaseSlice.actions;

export default showcaseSlice.reducer;