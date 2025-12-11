import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, clearAuth } from '@/shared/store/authStore';
import { refresh } from '@/features/auth/api/auth.api';
import { parseError } from './parseError';

/**
 * -------------------------------------------------------
 * API Client (Axios Instance)
 * -------------------------------------------------------
 * - Adds Authorization header automatically
 * - Sends cookies (refresh token)
 * - Handles 401 errors
 * - Auto-refreshes access token (single-flight)
 * - Retries original request after refresh
 * - Normalizes errors
 * -------------------------------------------------------
 */

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // IMPORTANT for refresh cookie
  timeout: 15000,
});

// ===============================
// Request Interceptor
// ===============================
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==================================================================
// Refresh Token Logic (Single-flight concurrency-safe queue pattern)
// ==================================================================
let isRefreshing = false;
let pendingRequests: ((token: string | null) => void)[] = [];

/**
 * Push requests into queue while refreshing.
 */
function addPendingRequest(callback: (token: string | null) => void) {
  pendingRequests.push(callback);
}

/**
 * Resolve queued requests once refresh is done.
 */
function resolvePendingRequests(newToken: string | null) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

// ===============================
// Response Interceptor
// ===============================
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refreshing is already happening → queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addPendingRequest((newToken) => {
            if (!newToken) return reject(error);

            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

            resolve(apiClient(originalRequest));
          });
        });
      }

      // First request that triggers refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken: newToken } = await refresh();

        setAccessToken(newToken);
        resolvePendingRequests(newToken);
        isRefreshing = false;

        // Retry failed request with new token
        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        // Refresh failed → clear auth, reject all queued
        clearAuth();
        resolvePendingRequests(null);
        isRefreshing = false;
        return Promise.reject(parseError(err));
      }
    }

    return Promise.reject(parseError(error));
  }
);
