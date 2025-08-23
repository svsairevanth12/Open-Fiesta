import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Keep initial value if localStorage fails
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  // Save to localStorage when value changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
  }, [key, value, isHydrated]);

  return [value, setValue] as const;
}
