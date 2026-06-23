/**
 * API Utility helpers to resolve backend URLs dynamically
 * Supports swapping local/production endpoints via VITE_API_BASE_URL
 */

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

/**
 * Resolves static resource URLs (e.g. avatars, upload files)
 * Safely handles both absolute and relative URLs.
 */
export const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const apiBase = getApiBaseUrl();

  // If the path already includes /api at start, use origin only
  if (url.startsWith('/api')) {
    const origin = apiBase.replace(/\/api$/, '');
    return `${origin}${url}`;
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return `${apiBase}${path}`;
};
