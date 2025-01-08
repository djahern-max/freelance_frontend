import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async Thunks
export const fetchShowcases = createAsyncThunk(
    'showcase/fetchShowcases',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/project-showcase/');
            return response.data;
        } catch (error) {
            return rejectWithValue(api.helpers.handleError(error));
        }
    }
);

export const createShowcase = createAsyncThunk(
    'showcase/createShowcase',
    async (showcaseData, { rejectWithValue }) => {
        try {
            const response = await api.showcase.create(showcaseData);
            return response;
        } catch (error) {
            return rejectWithValue(api.helpers.handleError(error));
        }
    }
);

export const updateShowcase = createAsyncThunk(
    'showcase/updateShowcase',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/project-showcase/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(api.helpers.handleError(error));
        }
    }
);

export const fetchShowcaseById = createAsyncThunk(
    'showcase/fetchShowcaseById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.showcase.getDetail(id);
            return response;
        } catch (error) {
            return rejectWithValue(api.helpers.handleError(error));
        }
    }
);

export const rateShowcase = createAsyncThunk(
    'showcase/rateShowcase',
    async ({ showcaseId, rating }, { rejectWithValue }) => {
        try {
            const response = await api.showcase.submitRating(showcaseId, rating);
            return response;
        } catch (error) {
            return rejectWithValue(api.helpers.handleError(error));
        }
    }
);

const showcaseSlice = createSlice({
    name: 'showcase',
    initialState: {
        items: [],
        currentShowcase: null,
        loading: false,
        error: null,
        createStatus: 'idle',
        updateStatus: 'idle'
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentShowcase: (state) => {
            state.currentShowcase = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch showcases
            .addCase(fetchShowcases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShowcases.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchShowcases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create showcase
            .addCase(createShowcase.pending, (state) => {
                state.createStatus = 'loading';
                state.error = null;
            })
            .addCase(createShowcase.fulfilled, (state, action) => {
                state.createStatus = 'succeeded';
                state.items.unshift(action.payload);
            })
            .addCase(createShowcase.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.error = action.payload;
            })
            // Update showcase
            .addCase(updateShowcase.pending, (state) => {
                state.updateStatus = 'loading';
                state.error = null;
            })
            .addCase(updateShowcase.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded';
                state.items = state.items.map(item =>
                    item.id === action.payload.id ? action.payload : item
                );
                if (state.currentShowcase?.id === action.payload.id) {
                    state.currentShowcase = action.payload;
                }
            })
            .addCase(updateShowcase.rejected, (state, action) => {
                state.updateStatus = 'failed';
                state.error = action.payload;
            })
            // Fetch single showcase
            .addCase(fetchShowcaseById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShowcaseById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentShowcase = action.payload;
            })
            .addCase(fetchShowcaseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Rate showcase
            .addCase(rateShowcase.fulfilled, (state, action) => {
                const { showcaseId, averageRating, totalRatings } = action.payload;
                state.items = state.items.map(item => {
                    if (item.id === showcaseId) {
                        return {
                            ...item,
                            average_rating: averageRating,
                            total_ratings: totalRatings
                        };
                    }
                    return item;
                });
                if (state.currentShowcase?.id === showcaseId) {
                    state.currentShowcase = {
                        ...state.currentShowcase,
                        average_rating: averageRating,
                        total_ratings: totalRatings
                    };
                }
            });
    }
});

// Selectors
export const selectAllShowcases = (state) => state.showcase.items;
export const selectCurrentShowcase = (state) => state.showcase.currentShowcase;
export const selectShowcaseLoading = (state) => state.showcase.loading;
export const selectShowcaseError = (state) => state.showcase.error;
export const selectCreateStatus = (state) => state.showcase.createStatus;
export const selectUpdateStatus = (state) => state.showcase.updateStatus;

export const { clearError, clearCurrentShowcase } = showcaseSlice.actions;

export default showcaseSlice.reducer;