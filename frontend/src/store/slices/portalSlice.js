import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchMyPortalRequest,
  updateMyProfileRequest,
  updateMyTargetProgressRequest,
  updateMyTaskStatusRequest,
  updateMyTrainingProgressRequest,
  uploadMyAvatarRequest,
} from '../../api/portalApi';
import { syncAuthUser, logout } from './authSlice';
import { addToast } from './uiSlice';

const computeSummaryFromUser = (user) => {
  const tasks = user?.tasks || [];
  const trainings = user?.trainings || [];
  const monthlyTargets = user?.monthlyTargets || [];

  const overallTargetCompletion =
    monthlyTargets.length > 0
      ? Math.round(
          monthlyTargets.reduce((sum, t) => {
            const pct = Math.min(
              100,
              Math.round(((t.achievedValue || 0) / (t.targetValue || 1)) * 100)
            );
            return sum + pct;
          }, 0) / monthlyTargets.length
        )
      : 0;

  return {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status !== 'completed').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter((c) => c.status === 'completed' || c.progress === 100)
      .length,
    avgTrainingProgress:
      trainings.length > 0
        ? Math.round(trainings.reduce((acc, c) => acc + (c.progress || 0), 0) / trainings.length)
        : 0,
    totalTargets: monthlyTargets.length,
    achievedTargets: monthlyTargets.filter(
      (t) => t.status === 'achieved' || t.achievedValue >= t.targetValue
    ).length,
    overallTargetCompletion,
  };
};

export const fetchMyPortal = createAsyncThunk(
  'portal/fetchMyPortal',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await fetchMyPortalRequest();
      dispatch(syncAuthUser(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'portal/updateMyProfile',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateMyProfileRequest(payload);
      dispatch(syncAuthUser(res.data.user));
      dispatch(addToast({ type: 'success', message: res.message || 'Profile updated' }));
      return res.data;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const uploadMyAvatar = createAsyncThunk(
  'portal/uploadMyAvatar',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const res = await uploadMyAvatarRequest(file);
      dispatch(syncAuthUser(res.data.user));
      dispatch(addToast({ type: 'success', message: res.message || 'Profile photo updated' }));
      return res.data;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateMyTaskStatus = createAsyncThunk(
  'portal/updateMyTaskStatus',
  async ({ taskId, status }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateMyTaskStatusRequest({ taskId, status });
      dispatch(addToast({ type: 'success', message: 'Task status updated' }));
      return res.data.user;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateMyTrainingProgress = createAsyncThunk(
  'portal/updateMyTrainingProgress',
  async ({ trainingId, progress }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateMyTrainingProgressRequest({ trainingId, progress });
      dispatch(addToast({ type: 'success', message: `Course progress set to ${progress}%` }));
      return res.data.user;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateMyTargetProgress = createAsyncThunk(
  'portal/updateMyTargetProgress',
  async ({ targetId, achievedValue, status }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateMyTargetProgressRequest({ targetId, achievedValue, status });
      dispatch(addToast({ type: 'success', message: 'Monthly target progress saved' }));
      return res.data.user;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

const portalSlice = createSlice({
  name: 'portal',
  initialState: {
    profile: null,
    completion: null,
    summary: null,
    taskFilter: 'all',
    editModalOpen: false,
    mediaModal: {
      open: false,
      mode: 'video',
      courseId: null,
    },
    loading: false,
    submitting: false,
    avatarUploading: false,
    updatingItemId: null,
    error: null,
  },
  reducers: {
    setPortalTaskFilter: (state, action) => {
      state.taskFilter = action.payload;
    },
    openSelfProfileModal: (state) => {
      state.editModalOpen = true;
    },
    closeSelfProfileModal: (state) => {
      state.editModalOpen = false;
    },
    openTrainingMediaModal: (state, action) => {
      state.mediaModal = {
        open: true,
        mode: action.payload.mode || 'video',
        courseId: action.payload.courseId,
      };
    },
    closeTrainingMediaModal: (state) => {
      state.mediaModal = {
        open: false,
        mode: 'video',
        courseId: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, (state) => {
        state.profile = null;
        state.completion = null;
        state.summary = null;
        state.editModalOpen = false;
        state.mediaModal = { open: false, mode: 'video', courseId: null };
      })
      .addCase(fetchMyPortal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPortal.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.completion = action.payload.completion;
        state.summary = action.payload.summary;
      })
      .addCase(fetchMyPortal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load workspace data';
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.editModalOpen = false;
        state.profile = action.payload.user;
        state.completion = action.payload.completion;
        state.summary = computeSummaryFromUser(action.payload.user);
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update profile';
      })
      .addCase(uploadMyAvatar.pending, (state) => {
        state.avatarUploading = true;
      })
      .addCase(uploadMyAvatar.fulfilled, (state, action) => {
        state.avatarUploading = false;
        state.profile = action.payload.user;
        state.completion = action.payload.completion;
      })
      .addCase(uploadMyAvatar.rejected, (state) => {
        state.avatarUploading = false;
      })
      .addCase(updateMyTaskStatus.pending, (state, action) => {
        state.updatingItemId = action.meta.arg.taskId;
      })
      .addCase(updateMyTaskStatus.fulfilled, (state, action) => {
        state.updatingItemId = null;
        state.profile = action.payload;
        state.summary = computeSummaryFromUser(action.payload);
      })
      .addCase(updateMyTaskStatus.rejected, (state) => {
        state.updatingItemId = null;
      })
      .addCase(updateMyTrainingProgress.pending, (state, action) => {
        state.updatingItemId = action.meta.arg.trainingId;
      })
      .addCase(updateMyTrainingProgress.fulfilled, (state, action) => {
        state.updatingItemId = null;
        state.profile = action.payload;
        state.summary = computeSummaryFromUser(action.payload);
      })
      .addCase(updateMyTrainingProgress.rejected, (state) => {
        state.updatingItemId = null;
      })
      .addCase(updateMyTargetProgress.pending, (state, action) => {
        state.updatingItemId = action.meta.arg.targetId;
      })
      .addCase(updateMyTargetProgress.fulfilled, (state, action) => {
        state.updatingItemId = null;
        state.profile = action.payload;
        state.summary = computeSummaryFromUser(action.payload);
      })
      .addCase(updateMyTargetProgress.rejected, (state) => {
        state.updatingItemId = null;
      });
  },
});

export const {
  setPortalTaskFilter,
  openSelfProfileModal,
  closeSelfProfileModal,
  openTrainingMediaModal,
  closeTrainingMediaModal,
} = portalSlice.actions;

export default portalSlice.reducer;
