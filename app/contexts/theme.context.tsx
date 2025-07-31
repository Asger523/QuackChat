import React, {createContext, useContext, useEffect, useState} from 'react';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the context interface
interface ThemeContextInterface {
  theme: typeof MD3LightTheme;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
}

// Create the context
const ThemeContext = createContext<ThemeContextInterface>({
  theme: MD3LightTheme,
  isDarkMode: false,
  toggleTheme: async () => {},
});

// Create a provider component
export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Load theme from AsyncStorage
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsThemeLoaded(true);
    }
  };

  // Toggle theme and save to storage
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  // Don't render until theme is loaded to prevent flash
  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{theme, isDarkMode, toggleTheme}}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
