import axios, { AxiosError } from 'axios';

/**
 * -------------------------------------------------------
 * Standard App Error Shape
 * -------------------------------------------------------
 * All UI layers must consume this shape only.
 * No component should deal with raw Axios errors.
 * -------------------------------------------------------
 */
export type AppError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

/**
 * -------------------------------------------------------
 * parseError
 * -------------------------------------------------------
 * Converts unknown / Axios errors into AppError
 * Safe to use everywhere (API, hooks, components)
 * -------------------------------------------------------
 */


export function parseError(error: unknown): AppError {
  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    const rawMessage =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message;

    return {
      message:
        typeof rawMessage === 'string'
          ? rawMessage
          : rawMessage?.message || 'Something went wrong',
      status: axiosError.response?.status,
      code: axiosError.response?.data?.code,
      details: axiosError.response?.data,
    };
  }

  // Native Error
  if (error instanceof Error) {
    return { message: error.message };
  }

  // Fallback
  return { message: 'Unexpected error occurred' };
}
