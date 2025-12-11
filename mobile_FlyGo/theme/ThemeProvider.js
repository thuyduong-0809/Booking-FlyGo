import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, lightColors, darkColors } from './theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setSystemTheme = () => {
    setThemeMode('system');
    saveThemePreference('system');
  };

  const setLightTheme = () => {
    setThemeMode('light');
    saveThemePreference('light');
  };

  const setDarkTheme = () => {
    setThemeMode('dark');
    saveThemePreference('dark');
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value = {
    mode: isDark ? 'dark' : 'light',
    theme,
    isDark,
    themeMode,
    toggle: toggleTheme,
    toggleTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
    colors: isDark ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

export function useTheme() {
  const { theme } = useThemeMode();
  return theme;
}


