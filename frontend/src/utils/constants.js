export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

export const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const ACTIVITY_ACTION_META = {
  USER_CREATED: {
    label: 'User Created',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  USER_UPDATED: {
    label: 'User Updated',
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  },
  STATUS_CHANGED: {
    label: 'Status Changed',
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  },
  USER_DELETED: {
    label: 'User Deleted',
    badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  },
};
