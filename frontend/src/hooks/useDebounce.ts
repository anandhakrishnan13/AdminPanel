import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
}

/**
 * Debounce a value
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounce a callback function
 */
export const useDebouncedCallback = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  options: UseDebounceOptions = {}
): ((...args: Parameters<T>) => void) => {
  const { delay = 500, leading = false } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leadingRef = useRef<boolean>(true);

  const debouncedCallback = useCallback((...args: Parameters<T>): void => {
    if (leading && leadingRef.current) {
      callback(...args);
      leadingRef.current = false;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!leading) {
        callback(...args);
      }
      leadingRef.current = true;
    }, delay);
  }, [callback, delay, leading]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export default useDebounce;
