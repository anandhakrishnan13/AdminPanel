import { useState, useCallback } from 'react';
import type { ApiResponse, ApiError, PaginationMeta } from '@/types';

interface UseFetchOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

interface FetchState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  pagination: PaginationMeta | null;
}

interface UseFetchReturn<T> extends FetchState<T> {
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const useFetch = <T>(options: UseFetchOptions = {}): UseFetchReturn<T> => {
  const { baseUrl = DEFAULT_BASE_URL, headers: defaultHeaders = {} } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
    pagination: null,
  });

  const execute = useCallback(async (
    url: string,
    requestOptions: RequestInit = {}
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...requestOptions.headers,
        },
      });

      const json = await response.json() as ApiResponse<T> | ApiError;

      if (!response.ok || !json.success) {
        const errorResponse = json as ApiError;
        const errorMessage = errorResponse.error?.message ?? 'An error occurred';
        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        return null;
      }

      const successResponse = json as ApiResponse<T>;
      setState({
        data: successResponse.data,
        error: null,
        isLoading: false,
        pagination: successResponse.meta?.pagination ?? null,
      });

      return successResponse.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [baseUrl, defaultHeaders]);

  const reset = useCallback((): void => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      pagination: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

export default useFetch;
