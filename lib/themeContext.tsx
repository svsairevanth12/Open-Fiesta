"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  ThemeConfig,
  ThemeMode,
  AccentColor,
  FontFamily,
  BackgroundStyle,
  DEFAULT_THEME,
  validateThemeConfig,
} from "./themes";
import {
  applyTheme,
  saveTheme,
  loadTheme,
  loadGoogleFont,
  withThemeTransition,
  logThemeInfo,
} from "./themeUtils";

// Theme Context Interface
interface ThemeContextType {
  // Current theme configuration
  theme: ThemeConfig;

  // Individual setters for each theme aspect
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setFont: (font: FontFamily) => void;
  setBackground: (background: BackgroundStyle) => void;

  // Convenience methods
  toggleMode: () => void;
  resetTheme: () => void;
  updateTheme: (partial: Partial<ThemeConfig>) => void;

  // State indicators
  isLoading: boolean;
  isInitialized: boolean;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<ThemeConfig>;
  enableTransitions?: boolean;
  enableLogging?: boolean;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = {},
  enableTransitions = true,
  enableLogging = false,
}) => {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme with optional transitions
  const applyThemeWithTransition = useCallback(
    (newTheme: ThemeConfig) => {
      if (enableTransitions) {
        withThemeTransition(() => applyTheme(newTheme));
      } else {
        applyTheme(newTheme);
      }

      if (enableLogging) {
        logThemeInfo(newTheme);
      }
    },
    [enableTransitions, enableLogging]
  );

  // Update theme state and apply changes
  const updateThemeState = useCallback(
    (newTheme: ThemeConfig) => {
      setTheme(newTheme);
      applyThemeWithTransition(newTheme);
      saveTheme(newTheme);
    },
    [applyThemeWithTransition]
  );

  // Individual theme setters
  const setMode = useCallback(
    (mode: ThemeMode) => {
      setTheme((currentTheme) => {
        const newTheme: ThemeConfig = { ...currentTheme, mode };
        // Apply theme changes outside of setState to avoid infinite loops
        setTimeout(() => updateThemeState(newTheme), 0);
        return newTheme;
      });
    },
    [updateThemeState]
  );

  const setAccent = useCallback(
    (accent: AccentColor) => {
      setTheme((currentTheme) => {
        const newTheme: ThemeConfig = { ...currentTheme, accent };
        setTimeout(() => updateThemeState(newTheme), 0);
        return newTheme;
      });
    },
    [updateThemeState]
  );

  const setFont = useCallback(
    (font: FontFamily) => {
      // Pre-load the font if it's a Google Font (non-blocking)
      if (font !== "geist") {
        loadGoogleFont(font).catch((error) => {
          console.warn("Failed to load font:", error);
        });
      }

      setTheme((currentTheme) => {
        const newTheme: ThemeConfig = { ...currentTheme, font };
        setTimeout(() => updateThemeState(newTheme), 0);
        return newTheme;
      });
    },
    [updateThemeState]
  );

  const setBackground = useCallback(
    (background: BackgroundStyle) => {
      setTheme((currentTheme) => {
        const newTheme: ThemeConfig = { ...currentTheme, background };
        setTimeout(() => updateThemeState(newTheme), 0);
        return newTheme;
      });
    },
    [updateThemeState]
  );

  // Convenience methods
  const toggleMode = useCallback(() => {
    setTheme((currentTheme) => {
      const newMode: ThemeMode =
        currentTheme.mode === "dark" ? "light" : "dark";
      const newTheme: ThemeConfig = { ...currentTheme, mode: newMode };
      setTimeout(() => updateThemeState(newTheme), 0);
      return newTheme;
    });
  }, [updateThemeState]);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    setTimeout(() => updateThemeState(DEFAULT_THEME), 0);
  }, [updateThemeState]);

  const updateTheme = useCallback(
    (partial: Partial<ThemeConfig>) => {
      setTheme((currentTheme) => {
        const newTheme = validateThemeConfig({ ...currentTheme, ...partial });
        setTimeout(() => updateThemeState(newTheme), 0);
        return newTheme;
      });
    },
    [updateThemeState]
  );

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Load theme from localStorage or use initial/default theme
        const savedTheme = loadTheme();
        const baseTheme = savedTheme || { ...DEFAULT_THEME, ...initialTheme };
        const validatedTheme = validateThemeConfig(baseTheme);

        // Pre-load the initial font if needed
        if (validatedTheme.font !== "geist") {
          try {
            await loadGoogleFont(validatedTheme.font);
          } catch (error) {
            console.warn("Failed to load initial font:", error);
          }
        }

        // Apply the theme
        setTheme(validatedTheme);
        applyTheme(validatedTheme);

        if (enableLogging) {
          logThemeInfo(validatedTheme);
        }
      } catch (error) {
        console.error("Failed to initialize theme:", error);
        // Fallback to default theme
        setTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, [initialTheme, enableLogging]);

  // Handle system theme changes (optional enhancement)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const savedTheme = loadTheme();
      if (!savedTheme) {
        setMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [setMode]);

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    setMode,
    setAccent,
    setFont,
    setBackground,
    toggleMode,
    resetTheme,
    updateTheme,
    isLoading,
    isInitialized,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Custom hook for theme loading state
export const useThemeLoading = (): boolean => {
  const { isLoading } = useTheme();
  return isLoading;
};

// Custom hook for theme initialization state
export const useThemeInitialized = (): boolean => {
  const { isInitialized } = useTheme();
  return isInitialized;
};

// Higher-order component for theme-aware components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeConfig }>
) => {
  const ThemedComponent: React.FC<P> = (props) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };

  ThemedComponent.displayName = `withTheme(${
    Component.displayName || Component.name
  })`;
  return ThemedComponent;
};

// Theme debugging utilities for development
export const ThemeDebugger: React.FC = () => {
  const { theme } = useTheme();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <div>
        <strong>Theme Debug</strong>
      </div>
      <div>Mode: {theme.mode}</div>
      <div>Accent: {theme.accent}</div>
      <div>Font: {theme.font}</div>
      <div>Background: {theme.background}</div>
    </div>
  );
};
