'use client'

import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query client
 * - Centralized config
 * - Easy to tune retries & caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                 // avoid aggressive retries
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,     // 1 minute
    },
    mutations: {
      retry: 0,
    },
  },
});


