import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  assignTargetRequest,
  assignTaskRequest,
  assignTrainingRequest,
  createUserRequest,
  deleteUserRequest,
  fetchUserByIdRequest,
  fetchUsersRequest,
  removeTargetRequest,
  removeTaskRequest,
  removeTrainingRequest,
  updateUserRequest,
  updateUserStatusRequest,
  uploadUserAvatarRequest,
} from '../../api/userApi';
import { syncAuthUser } from './authSlice';
import { addToast } from './uiSlice';

const defaultFilters = {
  page: 1,
  limit: 8,
  search: '',
  department: '',
  role: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (customParams, { getState, rejectWithValue }) => {
    try {
      const filters = customParams || getState().users.filters;
      return await fetchUsersRequest(filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchUserByIdRequest(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await createUserRequest(payload);
      dispatch(addToast({ type: 'success', message: res.message || 'User created successfully' }));
      return res;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateUserRequest({ id, payload });
      dispatch(syncAuthUser(res.data.user));
      dispatch(addToast({ type: 'success', message: res.message || 'Profile updated successfully' }));
      return res;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateUserStatusRequest({ id, status });
      dispatch(addToast({ type: 'success', message: res.message || 'Account status updated' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'users/uploadAvatar',
  async ({ id, file }, { dispatch, rejectWithValue }) => {
    try {
      const res = await uploadUserAvatarRequest({ id, file });
      dispatch(syncAuthUser(res.data.user));
      dispatch(addToast({ type: 'success', message: res.message || 'Profile photo updated' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await deleteUserRequest(id);
      dispatch(addToast({ type: 'success', message: res.message || 'User deleted permanently' }));
      return { id, message: res.message };
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const assignUserItem = createAsyncThunk(
  'users/assignUserItem',
  async ({ userId, kind, data }, { dispatch, rejectWithValue }) => {
    try {
      let res;
      if (kind === 'task') res = await assignTaskRequest({ userId, task: data });
      else if (kind === 'training') res = await assignTrainingRequest({ userId, training: data });
      else res = await assignTargetRequest({ userId, target: data });
      dispatch(addToast({ type: 'success', message: res.message }));
      return res.data.user;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const removeUserItem = createAsyncThunk(
  'users/removeUserItem',
  async ({ userId, kind, itemId }, { dispatch, rejectWithValue }) => {
    try {
      let res;
      if (kind === 'task') res = await removeTaskRequest({ userId, taskId: itemId });
      else if (kind === 'training') res = await removeTrainingRequest({ userId, trainingId: itemId });
      else res = await removeTargetRequest({ userId, targetId: itemId });
      dispatch(addToast({ type: 'info', message: res.message }));
      return res.data.user;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 8,
      totalPages: 1,
    },
    filters: { ...defaultFilters },
    selectedUser: null,
    selectedCompletion: null,
    selectedActivities: [],
    loading: false,
    detailLoading: false,
    submitting: false,
    avatarUploading: false,
    actionLoadingId: null,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetFilters: (state) => {
      state.filters = { ...defaultFilters };
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load users';
      })
      .addCase(fetchUserById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedUser = action.payload.user;
        state.selectedCompletion = action.payload.completion;
        state.selectedActivities = action.payload.recentActivities || [];
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load user profile';
      })
      .addCase(createUser.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create user';
      })
      .addCase(updateUser.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data.user;
        state.list = state.list.map((u) => (u._id === updated._id ? updated : u));
        if (state.selectedUser?._id === updated._id) {
          state.selectedUser = updated;
          state.selectedCompletion = {
            percentage: updated.profileCompletion,
            missingFields: updated.missingFields || [],
          };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update user';
      })
      .addCase(toggleUserStatus.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const updated = action.payload.data.user;
        state.list = state.list.map((u) => (u._id === updated._id ? updated : u));
        if (state.selectedUser?._id === updated._id) {
          state.selectedUser = updated;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload || 'Failed to update status';
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.avatarUploading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.avatarUploading = false;
        const updated = action.payload.data.user;
        state.list = state.list.map((u) => (u._id === updated._id ? updated : u));
        if (state.selectedUser?._id === updated._id) {
          state.selectedUser = updated;
          state.selectedCompletion = {
            percentage: updated.profileCompletion,
            missingFields: updated.missingFields || [],
          };
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarUploading = false;
        state.error = action.payload || 'Failed to upload image';
      })
      .addCase(deleteUser.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.list = state.list.filter((u) => u._id !== action.payload.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload || 'Failed to delete user';
      })
      .addCase(assignUserItem.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignUserItem.fulfilled, (state, action) => {
        state.submitting = false;
        state.selectedUser = action.payload;
      })
      .addCase(assignUserItem.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(removeUserItem.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearUserError } = userSlice.actions;
export default userSlice.reducer;
