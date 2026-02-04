// Centralized API URL configuration
// All microservices are exposed through nginx API gateway at a single URL
//
// Environment     Base URL
// Local           http://localhost:8080
// Production      https://api.contextreach.ai
//
// Path-based routing (handled by nginx):
//   /api/auth/*      → discovery-engine
//   /api/campaigns/* → discovery-engine
//   /api/context/*   → context-engine
//   /api/sequence/*  → composition-engine
//   /api/oauth/*     → delivery-engine

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Remove any trailing /api/... paths and trailing slashes
export const API_URL = rawApiUrl.replace(/\/api\/.*$/, '').replace(/\/$/, '');

// For debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL configured as:', API_URL);
}
