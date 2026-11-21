import { createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';

let nextToastId = 1;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeRequests: 0,
    sidebarOpen: false,
    toasts: [],
    userFormModal: {
      open: false,
      mode: 'create',
      user: null,
    },
    userDetailModal: {
      open: false,
      user: null,
    },
    confirmDialog: {
      open: false,
      actionType: null,
      user: null,
    },
  },
  reducers: {
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: ({ type = 'success', message }) => ({
        payload: {
          id: nextToastId++,
          type,
          message,
        },
      }),
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openUserFormModal: (state, action) => {
      state.userFormModal = {
        open: true,
        mode: action.payload?.mode || 'create',
        user: action.payload?.user || null,
      };
    },
    closeUserFormModal: (state) => {
      state.userFormModal = {
        open: false,
        mode: 'create',
        user: null,
      };
    },
    openUserDetailModal: (state, action) => {
      state.userDetailModal = {
        open: true,
        user: action.payload,
      };
    },
    closeUserDetailModal: (state) => {
      state.userDetailModal = {
        open: false,
        user: null,
      };
    },
    openConfirmDialog: (state, action) => {
      state.confirmDialog = {
        open: true,
        actionType: action.payload.actionType,
        user: action.payload.user,
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        open: false,
        actionType: null,
        user: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state) => {
        state.activeRequests += 1;
      })
      .addMatcher(isFulfilled, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
      })
      .addMatcher(isRejected, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
      });
  },
});

export const {
  openSidebar,
  closeSidebar,
  addToast,
  removeToast,
  openUserFormModal,
  closeUserFormModal,
  openUserDetailModal,
  closeUserDetailModal,
  openConfirmDialog,
  closeConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
