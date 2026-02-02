// Centralized API URL configuration
// Clean up the API URL - remove any trailing paths and ensure proper format
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// Remove any trailing /api/... paths and trailing slashes
export const API_URL = rawApiUrl.replace(/\/api\/.*$/, '').replace(/\/$/, '');

// For debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL configured as:', API_URL);
}
