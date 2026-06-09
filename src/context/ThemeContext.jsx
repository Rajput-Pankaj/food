import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useStoreSettings } from '../hooks/useStoreSettings';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'foodexpress_theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#030712' : '#16a34a');
}

export function ThemeProvider({ children }) {
  const { settings } = useStoreSettings();
  const darkModeAllowed = settings.darkModeEnabled !== false;
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const effectiveTheme = darkModeAllowed ? theme : 'light';
    applyTheme(effectiveTheme);
    if (darkModeAllowed) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* ignore storage errors */
      }
    }
  }, [theme, darkModeAllowed]);

  const toggleTheme = () => {
    if (!darkModeAllowed) return;
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme: darkModeAllowed ? theme : 'light',
      toggleTheme,
      isDark: darkModeAllowed && theme === 'dark',
      darkModeAllowed,
    }),
    [theme, darkModeAllowed]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
