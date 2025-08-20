/**
 * Theme System Configuration
 * Defines all theme options, types, and constants for the Open Fiesta application
 */

// Theme Mode Types
export type ThemeMode = "light" | "dark";
export type AccentColor = "crimson" | "emerald" | "blue" | "purple";
export type FontFamily = "geist" | "inter" | "mono" | "poppins";
export type BackgroundStyle = "gradient" | "minimal" | "mesh" | "particles";

// Complete Theme Configuration Interface
export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  font: FontFamily;
  background: BackgroundStyle;
}

// Accent Color Definitions
export interface AccentDefinition {
  id: AccentColor;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  tertiary: string;
  background: {
    primary: string;
    secondary: string;
  };
  gradient: {
    light: string;
    dark: string;
  };
}

// Font Family Definitions
export interface FontDefinition {
  id: FontFamily;
  name: string;
  description: string;
  primary: string;
  secondary?: string;
  googleFont?: string;
  fallback: string;
}

// Background Style Definitions
export interface BackgroundDefinition {
  id: BackgroundStyle;
  name: string;
  description: string;
  className: string;
}

// Accent Color Configurations
export const ACCENT_COLORS: Record<AccentColor, AccentDefinition> = {
  crimson: {
    id: "crimson",
    name: "Crimson",
    description: "Bold and energetic red",
    primary: "#e42a42",
    secondary: "#cf243a",
    tertiary: "#b91c3c",
    background: {
      primary: "rgba(228, 42, 66, 0.15)",
      secondary: "rgba(228, 42, 66, 0.06)",
    },
    gradient: {
      light:
        "linear-gradient(135deg, #fecaca 0%, #f87171 25%, #ef4444 50%, #dc2626 75%, #b91c1c 100%)",
      dark: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #c81e3a 0%, #a51d35 16%, #7d1a2f 32%, #591828 46%, #3c1722 60%, #2a151d 72%, #1f1317 84%, #141013 94%, #0a0a0a 100%)",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    description: "Fresh and natural green",
    primary: "#10b981",
    secondary: "#059669",
    tertiary: "#047857",
    background: {
      primary: "rgba(16, 185, 129, 0.15)",
      secondary: "rgba(16, 185, 129, 0.06)",
    },
    gradient: {
      light:
        "linear-gradient(135deg, #d1fae5 0%, #6ee7b7 25%, #34d399 50%, #10b981 75%, #059669 100%)",
      dark: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #10b981 0%, #059669 16%, #047857 32%, #065f46 46%, #064e3b 60%, #052e16 72%, #0a0e0a 84%, #0f0f0f 94%, #0a0a0a 100%)",
    },
  },
  blue: {
    id: "blue",
    name: "Ocean Blue",
    description: "Calm and professional blue",
    primary: "#3b82f6",
    secondary: "#2563eb",
    tertiary: "#1d4ed8",
    background: {
      primary: "rgba(59, 130, 246, 0.15)",
      secondary: "rgba(59, 130, 246, 0.06)",
    },
    gradient: {
      light:
        "linear-gradient(135deg, #dbeafe 0%, #93c5fd 25%, #60a5fa 50%, #3b82f6 75%, #2563eb 100%)",
      dark: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #3b82f6 0%, #2563eb 16%, #1d4ed8 32%, #1e40af 46%, #1e3a8a 60%, #1e3a8a 72%, #0f1629 84%, #0f1419 94%, #0a0a0a 100%)",
    },
  },
  purple: {
    id: "purple",
    name: "Royal Purple",
    description: "Creative and sophisticated purple",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    tertiary: "#6d28d9",
    background: {
      primary: "rgba(139, 92, 246, 0.15)",
      secondary: "rgba(139, 92, 246, 0.06)",
    },
    gradient: {
      light:
        "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 25%, #a78bfa 50%, #8b5cf6 75%, #7c3aed 100%)",
      dark: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #8b5cf6 0%, #7c3aed 16%, #6d28d9 32%, #5b21b6 46%, #4c1d95 60%, #3730a3 72%, #1e1b4b 84%, #0f0f23 94%, #0a0a0a 100%)",
    },
  },
};

// Font Family Configurations
export const FONT_FAMILIES: Record<FontFamily, FontDefinition> = {
  geist: {
    id: "geist",
    name: "Geist",
    description: "Modern and clean (current)",
    primary: "var(--font-geist-sans)",
    secondary: "var(--font-geist-mono)",
    fallback: "system-ui, -apple-system, sans-serif",
  },
  inter: {
    id: "inter",
    name: "Inter",
    description: "Professional and readable",
    primary: "var(--font-inter)",
    secondary: "var(--font-inter)",
    googleFont: "Inter:wght@300;400;500;600;700",
    fallback: "system-ui, -apple-system, sans-serif",
  },
  mono: {
    id: "mono",
    name: "JetBrains Mono",
    description: "Developer-focused monospace",
    primary: "var(--font-jetbrains)",
    secondary: "var(--font-jetbrains)",
    googleFont: "JetBrains+Mono:wght@300;400;500;600;700",
    fallback: "monospace",
  },
  poppins: {
    id: "poppins",
    name: "Poppins",
    description: "Friendly and rounded",
    primary: "var(--font-poppins)",
    secondary: "var(--font-poppins)",
    googleFont: "Poppins:wght@300;400;500;600;700",
    fallback: "system-ui, -apple-system, sans-serif",
  },
};

// Background Style Configurations
export const BACKGROUND_STYLES: Record<BackgroundStyle, BackgroundDefinition> =
  {
    gradient: {
      id: "gradient",
      name: "Gradient",
      description: "Complex radial gradients (current)",
      className: "bg-gradient-theme",
    },
    minimal: {
      id: "minimal",
      name: "Minimal",
      description: "Simple solid colors",
      className: "bg-minimal-theme",
    },
    mesh: {
      id: "mesh",
      name: "Mesh",
      description: "Subtle geometric patterns",
      className: "bg-mesh-theme",
    },
    particles: {
      id: "particles",
      name: "Particles",
      description: "Animated dot patterns",
      className: "bg-particles-theme",
    },
  };

// Default Theme Configuration
export const DEFAULT_THEME: ThemeConfig = {
  mode: "dark",
  accent: "crimson",
  font: "geist",
  background: "gradient",
};

// Theme Validation Helpers
export const isValidThemeMode = (mode: string): mode is ThemeMode =>
  ["light", "dark"].includes(mode);

export const isValidAccentColor = (accent: string): accent is AccentColor =>
  Object.keys(ACCENT_COLORS).includes(accent);

export const isValidFontFamily = (font: string): font is FontFamily =>
  Object.keys(FONT_FAMILIES).includes(font);

export const isValidBackgroundStyle = (
  background: string
): background is BackgroundStyle =>
  Object.keys(BACKGROUND_STYLES).includes(background);

// Theme Configuration Validator
export const validateThemeConfig = (
  config: Partial<ThemeConfig>
): ThemeConfig => {
  return {
    mode: isValidThemeMode(config.mode || "")
      ? config.mode!
      : DEFAULT_THEME.mode,
    accent: isValidAccentColor(config.accent || "")
      ? config.accent!
      : DEFAULT_THEME.accent,
    font: isValidFontFamily(config.font || "")
      ? config.font!
      : DEFAULT_THEME.font,
    background: isValidBackgroundStyle(config.background || "")
      ? config.background!
      : DEFAULT_THEME.background,
  };
};

// CSS Class Name Generators
export const generateThemeClasses = (config: ThemeConfig): string[] => {
  return [
    config.mode,
    `accent-${config.accent}`,
    `font-${config.font}`,
    BACKGROUND_STYLES[config.background].className,
  ];
};

// CSS Variable Names
export const CSS_VARIABLES = {
  // Accent Colors
  ACCENT_PRIMARY: "--accent-primary",
  ACCENT_SECONDARY: "--accent-secondary",
  ACCENT_TERTIARY: "--accent-tertiary",
  ACCENT_BG_PRIMARY: "--accent-bg-primary",
  ACCENT_BG_SECONDARY: "--accent-bg-secondary",

  // Fonts
  FONT_PRIMARY: "--font-primary",
  FONT_SECONDARY: "--font-secondary",

  // Background
  BACKGROUND_PATTERN: "--background-pattern",
} as const;
