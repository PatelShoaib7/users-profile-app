import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getMeRequest, loginRequest } from '../../api/authApi';
import { STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '../../api/axiosClient';

const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
let storedUser = null;
try {
  const raw = localStorage.getItem(STORAGE_USER_KEY);
  storedUser = raw ? JSON.parse(raw) : null;
} catch {
  storedUser = null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await loginRequest(credentials);
      localStorage.setItem(STORAGE_TOKEN_KEY, result.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(result.user));
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      return null;
    }
    try {
      const user = await getMeRequest();
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken || null,
    loading: false,
    initializing: Boolean(storedToken),
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    syncAuthUser: (state, action) => {
      if (state.user && action.payload?._id === state.user._id) {
        state.user = action.payload;
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(verifySession.pending, (state) => {
        state.initializing = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload;
        } else {
          state.user = null;
          state.token = null;
        }
      })
      .addCase(verifySession.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearAuthError, syncAuthUser } = authSlice.actions;
export default authSlice.reducer;
