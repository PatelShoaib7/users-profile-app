import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchActivityLogsRequest } from '../../api/activityApi';

export const fetchActivityLogs = createAsyncThunk(
  'activities/fetchLogs',
  async (customParams, { getState, rejectWithValue }) => {
    try {
      const { page, limit, actionFilter } = getState().activities;
      const params = customParams || { page, limit, action: actionFilter };
      return await fetchActivityLogsRequest(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const activitySlice = createSlice({
  name: 'activities',
  initialState: {
    logs: [],
    page: 1,
    limit: 12,
    actionFilter: '',
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {
    setActivityPage: (state, action) => {
      state.page = action.payload;
    },
    setActivityActionFilter: (state, action) => {
      state.actionFilter = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load activity logs';
      });
  },
});

export const { setActivityPage, setActivityActionFilter } = activitySlice.actions;
export default activitySlice.reducer;
