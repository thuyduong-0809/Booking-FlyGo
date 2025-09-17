import React, { createContext, useContext, useMemo, useState } from 'react';
import { DarkTheme } from '@react-navigation/native';

export const ThemeContext = createContext({
  mode: 'dark',
  toggle: () => {},
  theme: DarkTheme,
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  const baseFonts = {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
  };
  const theme = useMemo(() => {
    if (mode === 'light') {
      return {
        dark: false,
        colors: {
          background: '#ffffff',
          card: '#f7f7f8',
          text: '#0b1220',
          border: '#e5e7eb',
          primary: '#5b6cff',
          textMuted: '#6b7280',
        },
        fonts: baseFonts,
      };
    }
    return {
      dark: true,
      colors: {
        background: '#0b1220',
        card: '#0f172a',
        text: '#e5e7eb',
        border: '#1f2937',
        primary: '#5b6cff',
        textMuted: '#94a3b8',
      },
      fonts: baseFonts,
    };
  }, [mode]);

  const value = useMemo(() => ({ mode, toggle: () => setMode(m => (m === 'dark' ? 'light' : 'dark')), theme }), [mode, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}


