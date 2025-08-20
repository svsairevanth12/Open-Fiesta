/**
 * Dedicated Accent Color System
 * Provides structured accent colors for interactive elements, highlights, and effects
 */

import { AccentColor } from "./themes";

// Accent Color Categories
export interface AccentColorDefinition {
  // Interactive Elements (buttons, links, inputs)
  interactive: {
    primary: string;
    hover: string;
    active: string;
    focus: string;
  };
  // Highlight Elements (status indicators, badges)
  highlight: {
    primary: string;
    secondary: string;
    subtle: string;
  };
  // Status Colors (success, warning, error, info)
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Glow Effects (soft, medium, strong)
  glow: {
    soft: string;
    medium: string;
    strong: string;
  };
}

// Accent Color System for each main accent
export const ACCENT_COLOR_SYSTEM: Record<AccentColor, AccentColorDefinition> = {
  crimson: {
    interactive: {
      primary: "#e42a42",
      hover: "#cf243a",
      active: "#b91c3c",
      focus: "rgba(228, 42, 66, 0.4)",
    },
    highlight: {
      primary: "#fbbf24",
      secondary: "#f59e0b",
      subtle: "rgba(251, 191, 36, 0.2)",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    glow: {
      soft: "rgba(228, 42, 66, 0.3)",
      medium: "rgba(228, 42, 66, 0.5)",
      strong: "rgba(228, 42, 66, 0.7)",
    },
  },
  emerald: {
    interactive: {
      primary: "#10b981",
      hover: "#059669",
      active: "#047857",
      focus: "rgba(16, 185, 129, 0.4)",
    },
    highlight: {
      primary: "#34d399",
      secondary: "#6ee7b7",
      subtle: "rgba(52, 211, 153, 0.2)",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    glow: {
      soft: "rgba(16, 185, 129, 0.3)",
      medium: "rgba(16, 185, 129, 0.5)",
      strong: "rgba(16, 185, 129, 0.7)",
    },
  },
  blue: {
    interactive: {
      primary: "#3b82f6",
      hover: "#2563eb",
      active: "#1d4ed8",
      focus: "rgba(59, 130, 246, 0.4)",
    },
    highlight: {
      primary: "#60a5fa",
      secondary: "#93c5fd",
      subtle: "rgba(96, 165, 250, 0.2)",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    glow: {
      soft: "rgba(59, 130, 246, 0.3)",
      medium: "rgba(59, 130, 246, 0.5)",
      strong: "rgba(59, 130, 246, 0.7)",
    },
  },
  purple: {
    interactive: {
      primary: "#8b5cf6",
      hover: "#7c3aed",
      active: "#6d28d9",
      focus: "rgba(139, 92, 246, 0.4)",
    },
    highlight: {
      primary: "#a78bfa",
      secondary: "#c4b5fd",
      subtle: "rgba(167, 139, 250, 0.2)",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    glow: {
      soft: "rgba(139, 92, 246, 0.3)",
      medium: "rgba(139, 92, 246, 0.5)",
      strong: "rgba(139, 92, 246, 0.7)",
    },
  },
};

// Helper function to get accent colors for a specific theme
export const getAccentColors = (accent: AccentColor): AccentColorDefinition => {
  return ACCENT_COLOR_SYSTEM[accent];
};

// CSS Variable Generator for Accent Colors
export const generateAccentColorVariables = (
  accent: AccentColor
): Record<string, string> => {
  const colors = getAccentColors(accent);

  return {
    // Interactive
    "--accent-interactive-primary": colors.interactive.primary,
    "--accent-interactive-hover": colors.interactive.hover,
    "--accent-interactive-active": colors.interactive.active,
    "--accent-interactive-focus": colors.interactive.focus,

    // Highlight
    "--accent-highlight-primary": colors.highlight.primary,
    "--accent-highlight-secondary": colors.highlight.secondary,
    "--accent-highlight-subtle": colors.highlight.subtle,

    // Status
    "--accent-success": colors.status.success,
    "--accent-warning": colors.status.warning,
    "--accent-error": colors.status.error,
    "--accent-info": colors.status.info,

    // Glow
    "--accent-glow-soft": colors.glow.soft,
    "--accent-glow-medium": colors.glow.medium,
    "--accent-glow-strong": colors.glow.strong,
  };
};

// Utility classes for accent elements
export const ACCENT_UTILITY_CLASSES = {
  // Interactive Elements
  button: {
    primary:
      "bg-[var(--accent-interactive-primary)] hover:bg-[var(--accent-interactive-hover)] active:bg-[var(--accent-interactive-active)] focus:ring-2 focus:ring-[var(--accent-interactive-focus)]",
    secondary:
      "border border-[var(--accent-interactive-primary)] text-[var(--accent-interactive-primary)] hover:bg-[var(--accent-interactive-primary)] hover:text-white",
    ghost:
      "text-[var(--accent-interactive-primary)] hover:bg-[var(--accent-highlight-subtle)]",
  },

  // Input Elements
  input: {
    focus:
      "focus:border-[var(--accent-interactive-primary)] focus:ring-2 focus:ring-[var(--accent-interactive-focus)]",
    error:
      "border-[var(--accent-error)] focus:border-[var(--accent-error)] focus:ring-[var(--accent-error)]",
  },

  // Link Elements
  link: {
    primary:
      "text-[var(--accent-interactive-primary)] hover:text-[var(--accent-interactive-hover)]",
    underline:
      "text-[var(--accent-interactive-primary)] hover:text-[var(--accent-interactive-hover)] underline decoration-[var(--accent-interactive-primary)]",
  },

  // Status Elements
  status: {
    success:
      "text-[var(--accent-success)] bg-[var(--accent-success)]/10 border-[var(--accent-success)]/20",
    warning:
      "text-[var(--accent-warning)] bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/20",
    error:
      "text-[var(--accent-error)] bg-[var(--accent-error)]/10 border-[var(--accent-error)]/20",
    info: "text-[var(--accent-info)] bg-[var(--accent-info)]/10 border-[var(--accent-info)]/20",
  },

  // Glow Effects
  glow: {
    soft: "shadow-lg shadow-[var(--accent-glow-soft)]",
    medium: "shadow-xl shadow-[var(--accent-glow-medium)]",
    strong: "shadow-2xl shadow-[var(--accent-glow-strong)]",
  },
};
