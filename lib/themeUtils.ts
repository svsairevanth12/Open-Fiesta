/**
 * Theme Utility Functions
 * Helper functions for theme management, CSS variable updates, and class generation
 */

import {
  ThemeConfig,
  AccentColor,
  FontFamily,
  ACCENT_COLORS,
  FONT_FAMILIES,
  BACKGROUND_STYLES,
  CSS_VARIABLES,
  generateThemeClasses,
} from "./themes";

// LocalStorage key for theme persistence
export const THEME_STORAGE_KEY = "ai-fiesta:theme";

// Theme Class Management
export const applyThemeClasses = (
  config: ThemeConfig,
  targetElement?: Element
): void => {
  const element = targetElement || document.documentElement;
  const classes = generateThemeClasses(config);

  // Remove existing theme classes
  element.classList.remove(
    "light",
    "dark",
    "accent-crimson",
    "accent-emerald",
    "accent-blue",
    "accent-purple",
    "font-geist",
    "font-inter",
    "font-mono",
    "font-poppins",
    "bg-gradient-theme",
    "bg-minimal-theme",
    "bg-mesh-theme",
    "bg-particles-theme"
  );

  // Apply new theme classes
  element.classList.add(...classes);
};

// CSS Variable Management
export const updateCSSVariables = (config: ThemeConfig): void => {
  const root = document.documentElement.style;
  const accent = ACCENT_COLORS[config.accent];
  const font = FONT_FAMILIES[config.font];

  // Update accent color variables
  root.setProperty(CSS_VARIABLES.ACCENT_PRIMARY, accent.primary);
  root.setProperty(CSS_VARIABLES.ACCENT_SECONDARY, accent.secondary);
  root.setProperty(CSS_VARIABLES.ACCENT_TERTIARY, accent.tertiary);
  root.setProperty(CSS_VARIABLES.ACCENT_BG_PRIMARY, accent.background.primary);
  root.setProperty(
    CSS_VARIABLES.ACCENT_BG_SECONDARY,
    accent.background.secondary
  );

  // Update font variables
  root.setProperty(CSS_VARIABLES.FONT_PRIMARY, font.primary);
  root.setProperty(
    CSS_VARIABLES.FONT_SECONDARY,
    font.secondary || font.primary
  );

  // Update background pattern
  const gradientKey = config.mode === "dark" ? "dark" : "light";
  root.setProperty(
    CSS_VARIABLES.BACKGROUND_PATTERN,
    accent.gradient[gradientKey]
  );
};

// Complete Theme Application
export const applyTheme = (config: ThemeConfig): void => {
  applyThemeClasses(config);
  updateCSSVariables(config);
};

// Theme Persistence
export const saveTheme = (config: ThemeConfig): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("Failed to save theme to localStorage:", error);
  }
};

export const loadTheme = (): ThemeConfig | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to load theme from localStorage:", error);
    return null;
  }
};

// Theme Transition Helpers
export const withThemeTransition = (
  callback: () => void,
  duration: number = 300
): void => {
  // Add transition class to body
  document.body.style.transition = `all ${duration}ms ease-in-out`;

  // Execute the theme change
  callback();

  // Remove transition after completion
  setTimeout(() => {
    document.body.style.transition = "";
  }, duration);
};

// Color Utility Functions
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getAccentColor = (
  accent: AccentColor,
  variant: "primary" | "secondary" | "tertiary" = "primary"
): string => {
  return ACCENT_COLORS[accent][variant];
};

// Font Loading Helpers
export const loadGoogleFont = async (fontFamily: FontFamily): Promise<void> => {
  const font = FONT_FAMILIES[fontFamily];

  if (!font.googleFont) {
    return; // Font is already loaded or doesn't require Google Fonts
  }

  try {
    // Create link element for Google Fonts
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;

    document.head.appendChild(link);
    document.head.appendChild(link2);
    document.head.appendChild(fontLink);

    // Wait for font to load
    await document.fonts.ready;
  } catch (error) {
    console.warn(`Failed to load Google Font ${fontFamily}:`, error);
  }
};

// Theme Preview Helpers
export const previewTheme = (
  config: ThemeConfig,
  previewElement: Element
): void => {
  applyThemeClasses(config, previewElement);

  // Apply inline styles for preview since CSS variables are global
  const accent = ACCENT_COLORS[config.accent];
  const element = previewElement as HTMLElement;

  element.style.setProperty("--accent-primary", accent.primary);
  element.style.setProperty("--accent-secondary", accent.secondary);
  element.style.setProperty("--accent-bg-primary", accent.background.primary);
};

// Theme Comparison Helpers
export const getThemeDifferences = (
  theme1: ThemeConfig,
  theme2: ThemeConfig
): (keyof ThemeConfig)[] => {
  const differences: (keyof ThemeConfig)[] = [];

  (Object.keys(theme1) as (keyof ThemeConfig)[]).forEach((key) => {
    if (theme1[key] !== theme2[key]) {
      differences.push(key);
    }
  });

  return differences;
};

// Accessibility Helpers
export const getContrastColor = (
  accent: AccentColor,
  mode: "light" | "dark"
): string => {
  // Return appropriate text color based on accent and mode for accessibility
  const lightColors: Record<AccentColor, string> = {
    crimson: "#ffffff",
    emerald: "#ffffff",
    blue: "#ffffff",
    purple: "#ffffff",
  };

  const darkColors: Record<AccentColor, string> = {
    crimson: "#000000",
    emerald: "#000000",
    blue: "#000000",
    purple: "#000000",
  };

  return mode === "dark" ? lightColors[accent] : darkColors[accent];
};

// Theme Analytics (for debugging)
export const logThemeInfo = (config: ThemeConfig): void => {
  if (process.env.NODE_ENV !== "development") return;

  console.group("🎨 Theme System Debug Info");
  console.log("Current Configuration:", config);
  console.log("Generated Classes:", generateThemeClasses(config));
  console.log("Accent Colors:", ACCENT_COLORS[config.accent]);
  console.log("Font Family:", FONT_FAMILIES[config.font]);
  console.log("Background Style:", BACKGROUND_STYLES[config.background]);
  console.groupEnd();
};
