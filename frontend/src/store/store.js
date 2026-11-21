import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice';
import activityReducer from './slices/activitySlice';
import portalReducer from './slices/portalSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    dashboard: dashboardReducer,
    activities: activityReducer,
    portal: portalReducer,
    ui: uiReducer,
  },
});
