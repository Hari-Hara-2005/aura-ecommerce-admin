import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleTheme as toggleThemeAction,
  setTheme as setThemeAction,
  selectTheme,
  selectIsDarkMode,
} from '../store/slices/themeSlice';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const isDark = useSelector(selectIsDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('aura_admin_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  const setTheme = (newTheme) => {
    dispatch(setThemeAction(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
