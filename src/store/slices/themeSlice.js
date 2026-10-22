import { createSlice } from '@reduxjs/toolkit';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('aura_admin_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('aura_admin_theme', theme);
  } catch {}
}

const initialTheme = getInitialTheme();
applyThemeToDocument(initialTheme);

const initialState = {
  theme: initialTheme,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      applyThemeToDocument(nextTheme);
    },
    setTheme: (state, action) => {
      const nextTheme = action.payload;
      if (nextTheme === 'dark' || nextTheme === 'light') {
        state.theme = nextTheme;
        applyThemeToDocument(nextTheme);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export const selectTheme = (state) => state.theme.theme;
export const selectIsDarkMode = (state) => state.theme.theme === 'dark';

export default themeSlice.reducer;
