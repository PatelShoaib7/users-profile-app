import { clientEnv } from '../config/env.js';

/**
 * Formats an ISO date string into a readable date (e.g., "Jan 15, 2024")
 */
export const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats an ISO date string into date + time for activity logs
 */
export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Formats a date string as YYYY-MM-DD for HTML <input type="date">
 */
export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Extracts up to 2 uppercase initials from a full name
 */
export const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/**
 * Resolves profile image URL (supports absolute URLs and backend /uploads paths)
 */
export const resolveAvatarUrl = (profileImage) => {
  if (!profileImage) return '';
  if (
    profileImage.startsWith('http://') ||
    profileImage.startsWith('https://') ||
    profileImage.startsWith('blob:')
  ) {
    return profileImage;
  }
  return `${clientEnv.backendOrigin}${profileImage}`;
};

/**
 * Resolves inline viewable URL for training PDFs served from backend /materials
 */
export const resolveMaterialViewUrl = (pdfUrl) => {
  if (!pdfUrl) return '';
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return pdfUrl;
  }
  return `${clientEnv.backendOrigin}${pdfUrl}`;
};

/**
 * Resolves attachment download URL for training PDFs via /api/materials/:filename/download
 */
export const resolveMaterialDownloadUrl = (pdfUrl, pdfTitle = '') => {
  if (!pdfUrl) return '';
  if (pdfUrl.startsWith('/materials/')) {
    const filename = pdfUrl.split('/').pop();
    const query = pdfTitle ? `?name=${encodeURIComponent(pdfTitle)}` : '';
    return `${clientEnv.apiUrl}/materials/${filename}/download${query}`;
  }
  return pdfUrl;
};

/**
 * Converts standard YouTube watch/share URLs into embeddable URLs if applicable
 */
export const getYoutubeEmbedUrl = (url = '') => {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  if (url.includes('youtube.com/embed/')) return url;
  return null;
};

/**
 * Formats an integer amount in Indian Rupees (e.g., ₹6,50,000)
 */
export const formatINR = (amount = 0) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Formats large INR values compactly in Lakhs / Thousands (e.g., ₹21.50L)
 */
export const formatCompactINR = (amount = 0) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return `₹${num}`;
};
