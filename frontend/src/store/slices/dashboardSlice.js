import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDashboardStatsRequest } from '../../api/dashboardApi';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDashboardStatsRequest();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialDrilldown = {
  open: false,
  section: 'employees', // 'employees' | 'attendance' | 'targets' | 'tasks' | 'budget'
  filter: 'all',
  department: '',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    loading: false,
    refreshing: false,
    error: null,
    drilldown: initialDrilldown,
  },
  reducers: {
    openDashboardDrilldown: (state, action) => {
      state.drilldown = {
        open: true,
        section: action.payload?.section || 'employees',
        filter: action.payload?.filter || 'all',
        department: action.payload?.department || '',
      };
    },
    updateDashboardDrilldown: (state, action) => {
      state.drilldown = {
        ...state.drilldown,
        ...action.payload,
      };
    },
    closeDashboardDrilldown: (state) => {
      state.drilldown = initialDrilldown;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        if (state.stats) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Failed to load dashboard insights';
      });
  },
});

export const {
  openDashboardDrilldown,
  updateDashboardDrilldown,
  closeDashboardDrilldown,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
