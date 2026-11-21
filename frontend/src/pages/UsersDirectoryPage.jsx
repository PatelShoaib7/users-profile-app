import { useEffect, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearUserError,
  createUser,
  deleteUser,
  fetchUsers,
  resetFilters,
  setFilters,
  toggleUserStatus,
  updateUser,
} from '../store/slices/userSlice';
import {
  closeConfirmDialog,
  closeUserDetailModal,
  closeUserFormModal,
  openConfirmDialog,
  openUserDetailModal,
  openUserFormModal,
} from '../store/slices/uiSlice';
import { useDebounce } from '../hooks/useDebounce';
import { UserFilters } from '../components/users/UserFilters';
import { UserTable } from '../components/users/UserTable';
import { Pagination } from '../components/common/Pagination';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { UserFormModal } from '../components/users/UserFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/StateFeedback';
import { TableSkeleton } from '../components/loaders/Skeletons';

export const UsersDirectoryPage = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { list, pagination, filters, loading, submitting, actionLoadingId, error } =
    useAppSelector((state) => state.users);
  const { userFormModal, userDetailModal, confirmDialog } = useAppSelector((state) => state.ui);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch, filters.search, dispatch]);

  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    return () => {
      dispatch(closeUserFormModal());
      dispatch(closeUserDetailModal());
      dispatch(closeConfirmDialog());
    };
  }, [dispatch]);

  const handleFilterChange = (partial) => {
    dispatch(setFilters(partial));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  const handleFormSubmit = async (formData) => {
    if (userFormModal.mode === 'create') {
      const action = await dispatch(createUser(formData));
      if (createUser.fulfilled.match(action)) {
        dispatch(closeUserFormModal());
        dispatch(fetchUsers(filters));
      }
    } else if (userFormModal.user) {
      const action = await dispatch(updateUser({ id: userFormModal.user._id, payload: formData }));
      if (updateUser.fulfilled.match(action)) {
        dispatch(closeUserFormModal());
      }
    }
  };

  const requestStatusToggle = (targetUser) => {
    if (targetUser.status === 'active') {
      dispatch(openConfirmDialog({ actionType: 'deactivate', user: targetUser }));
    } else {
      dispatch(toggleUserStatus({ id: targetUser._id, status: 'active' }));
    }
  };

  const requestDelete = (targetUser) => {
    dispatch(openConfirmDialog({ actionType: 'delete', user: targetUser }));
  };

  const handleConfirmAction = async () => {
    const target = confirmDialog.user;
    if (!target) return;

    if (confirmDialog.actionType === 'delete') {
      const res = await dispatch(deleteUser(target._id));
      if (deleteUser.fulfilled.match(res)) {
        dispatch(closeConfirmDialog());
        dispatch(fetchUsers(filters));
      }
    } else if (confirmDialog.actionType === 'deactivate') {
      await dispatch(toggleUserStatus({ id: target._id, status: 'inactive' }));
      dispatch(closeConfirmDialog());
    }
  };

  const isSearchPending = searchInput !== filters.search || loading;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-sm text-slate-500">
            Search, filter, onboard, and manage user profiles across all departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            dispatch(clearUserError());
            dispatch(openUserFormModal({ mode: 'create', user: null }));
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm self-start"
        >
          <FiPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {error && !userFormModal.open && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-sm text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => dispatch(clearUserError())}>
            <FiX className="h-4 w-4 text-rose-600" />
          </button>
        </div>
      )}

      <UserFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        isSearching={isSearchPending}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No matching user profiles"
          description="Try adjusting your search query or clearing department, role, and status filters."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div>
          <UserTable
            users={list}
            currentUser={currentUser}
            actionLoadingId={actionLoadingId}
            onQuickView={(u) => dispatch(openUserDetailModal(u))}
            onEdit={(u) => {
              dispatch(clearUserError());
              dispatch(openUserFormModal({ mode: 'edit', user: u }));
            }}
            onToggleStatus={requestStatusToggle}
            onDelete={requestDelete}
          />
          <Pagination
            pagination={pagination}
            onPageChange={(nextPage) => handleFilterChange({ page: nextPage })}
          />
        </div>
      )}

      <UserDetailModal
        user={userDetailModal.open ? userDetailModal.user : null}
        onClose={() => dispatch(closeUserDetailModal())}
      />

      <UserFormModal
        open={userFormModal.open}
        mode={userFormModal.mode}
        initialUser={userFormModal.user}
        currentUserRole={currentUser?.role}
        submitting={submitting}
        serverError={error}
        onClose={() => {
          dispatch(clearUserError());
          dispatch(closeUserFormModal());
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.actionType === 'delete'
            ? `Delete ${confirmDialog.user?.fullName}?`
            : `Deactivate ${confirmDialog.user?.fullName}?`
        }
        description={
          confirmDialog.actionType === 'delete'
            ? 'This action permanently removes the user profile from the directory. An audit entry will be recorded in Activity Logs.'
            : 'Deactivating this user suspends their account access until re-activated by an Admin or HR member.'
        }
        confirmLabel={
          confirmDialog.actionType === 'delete' ? 'Delete Permanently' : 'Deactivate Account'
        }
        variant={confirmDialog.actionType === 'delete' ? 'danger' : 'warning'}
        loading={Boolean(actionLoadingId)}
        onConfirm={handleConfirmAction}
        onCancel={() => dispatch(closeConfirmDialog())}
      />
    </div>
  );
};
