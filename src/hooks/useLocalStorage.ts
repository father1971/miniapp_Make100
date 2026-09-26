import { useState, useCallback, useEffect } from 'react';

/**
 * Безопасный хук для работы с localStorage.
 * Предотвращает краши при приватном режиме браузера, переполнении квоты или невалидном JSON.
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue instanceof Function ? initialValue() : initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key "${key}" even though window is not defined`);
        return;
      }

      try {
        setStoredValue((prev) => {
          const newValue = value instanceof Function ? value(prev) : value;
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
          }
          return newValue;
        });
      } catch (error) {
        console.warn(`Error executing setValue for key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [key, readValue]);

  return [storedValue, setValue];
}
