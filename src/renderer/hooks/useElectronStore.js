/* eslint-disable import/prefer-default-export */
import { useState, useCallback, useEffect } from 'react';

export function useElectronStore(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await window.electron.settingsGet(key);
        if (value !== undefined) {
          setStoredValue(value);
        }
      } catch {
        // ignore read failures and keep current state
      }
    };

    loadValue();
  }, [key]);

  const setValue = useCallback(
    (value) => {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      window.electron.settingsSet(key, newValue);
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}
