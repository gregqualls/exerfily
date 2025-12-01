import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'clean' | 'mermaid' | 'dark' | 'natural' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'exerfily-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'mermaid'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && ['clean', 'mermaid', 'dark', 'natural', 'neon'].includes(stored)) {
        return stored;
      }
    }
    return 'mermaid';
  });

  useEffect(() => {
    // Apply theme class to document root
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-clean', 'theme-mermaid', 'theme-dark', 'theme-natural', 'theme-neon');
    
    // Add current theme class (mermaid is default, so only add if not mermaid)
    if (theme !== 'mermaid') {
      root.classList.add(`theme-${theme}`);
    }
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


