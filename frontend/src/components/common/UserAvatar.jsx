import { useState } from 'react';
import { getInitials, resolveAvatarUrl } from '../../utils/formatters';

export const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-24 w-24 text-2xl',
  };

  const src = resolveAvatarUrl(user?.profileImage);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={user?.fullName || 'User avatar'}
        onError={() => setImgError(true)}
        className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover ring-2 ring-white shadow-sm bg-slate-100 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size] || sizeMap.md} rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center ring-2 ring-white shadow-sm shrink-0 ${className}`}
    >
      {getInitials(user?.fullName)}
    </div>
  );
};
