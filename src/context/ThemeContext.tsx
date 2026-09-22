import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  badge: string;
  shadow: string;
  isDark: boolean;
}

const lightTheme: ThemeColors = {
  primary: '#059669', // Emerald 600
  primaryLight: '#D1FAE5',
  primaryDark: '#047857',
  secondary: '#F59E0B', // Amber 500
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9', // Slate 100
  card: '#FFFFFF',
  border: '#E2E8F0', // Slate 200
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  badge: '#E0F2FE',
  shadow: '#000000',
  isDark: false,
};

const darkTheme: ThemeColors = {
  primary: '#10B981', // Emerald 500
  primaryLight: '#064E3B',
  primaryDark: '#059669',
  secondary: '#FBBF24',
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceSecondary: '#334155', // Slate 700
  card: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  error: '#F87171',
  errorLight: '#450A0A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#451A03',
  info: '#60A5FA',
  badge: '#1E3A8A',
  shadow: '#000000',
  isDark: true,
};

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setScheme: (mode: 'light' | 'dark' | 'system') => void;
  currentMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setScheme: () => {},
  currentMode: 'light',
});

const THEME_STORAGE_KEY = '@souqplus_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [currentMode, setCurrentMode] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setCurrentMode(saved);
        }
      } catch (e) {
        console.warn('Error loading theme preference', e);
      }
    })();
  }, []);

  const isDark =
    currentMode === 'dark' ||
    (currentMode === 'system' && systemScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = async () => {
    const nextMode = isDark ? 'light' : 'dark';
    setCurrentMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (e) {
      console.warn('Error saving theme', e);
    }
  };

  const setScheme = async (mode: 'light' | 'dark' | 'system') => {
    setCurrentMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Error saving theme', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setScheme, currentMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
