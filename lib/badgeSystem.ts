/**
 * Badge Pairing System
 * Provides structured Pro/Free badge combinations with consistent theming
 */

import { BadgePair, BadgeType } from "./themes";

export interface BadgeStyle {
  background: string;
  text: string;
  border: string;
  glow?: string;
}

export interface BadgePairDefinition {
  id: BadgePair;
  name: string;
  description: string;
  pro: BadgeStyle;
  free: BadgeStyle;
}

// Badge Pair Definitions
export const BADGE_PAIRS: Record<BadgePair, BadgePairDefinition> = {
  "red-gold": {
    id: "red-gold",
    name: "Red & Gold",
    description: "Current Pro/Free styling - Bold and premium",
    pro: {
      background: "linear-gradient(135deg, #e42a42 0%, #cf243a 100%)",
      text: "#ffffff",
      border: "rgba(228, 42, 66, 0.4)",
      glow: "rgba(228, 42, 66, 0.3)",
    },
    free: {
      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      text: "#000000",
      border: "rgba(251, 191, 36, 0.4)",
      glow: "rgba(251, 191, 36, 0.3)",
    },
  },
  "purple-blue": {
    id: "purple-blue",
    name: "Purple & Blue",
    description: "Modern tech gradient - Creative and professional",
    pro: {
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      text: "#ffffff",
      border: "rgba(139, 92, 246, 0.4)",
      glow: "rgba(139, 92, 246, 0.3)",
    },
    free: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      text: "#ffffff",
      border: "rgba(59, 130, 246, 0.4)",
      glow: "rgba(59, 130, 246, 0.3)",
    },
  },
  "green-emerald": {
    id: "green-emerald",
    name: "Green & Emerald",
    description: "Natural success pairing - Growth and harmony",
    pro: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      text: "#ffffff",
      border: "rgba(16, 185, 129, 0.4)",
      glow: "rgba(16, 185, 129, 0.3)",
    },
    free: {
      background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
      text: "#ffffff",
      border: "rgba(52, 211, 153, 0.4)",
      glow: "rgba(52, 211, 153, 0.3)",
    },
  },
  "orange-yellow": {
    id: "orange-yellow",
    name: "Orange & Yellow",
    description: "Warm energy pairing - Enthusiasm and optimism",
    pro: {
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      text: "#ffffff",
      border: "rgba(249, 115, 22, 0.4)",
      glow: "rgba(249, 115, 22, 0.3)",
    },
    free: {
      background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
      text: "#000000",
      border: "rgba(234, 179, 8, 0.4)",
      glow: "rgba(234, 179, 8, 0.3)",
    },
  },
};

// Helper Functions
export const getBadgePair = (pairId: BadgePair): BadgePairDefinition => {
  return BADGE_PAIRS[pairId];
};

export const getBadgeStyle = (
  pairId: BadgePair,
  type: BadgeType
): BadgeStyle => {
  const pair = getBadgePair(pairId);
  return pair[type];
};

// CSS Variable Generator for Badge Pairs
export const generateBadgeVariables = (
  pairId: BadgePair
): Record<string, string> => {
  const pair = getBadgePair(pairId);

  return {
    "--badge-pro-background": pair.pro.background,
    "--badge-pro-text": pair.pro.text,
    "--badge-pro-border": pair.pro.border,
    "--badge-pro-glow": pair.pro.glow || "transparent",

    "--badge-free-background": pair.free.background,
    "--badge-free-text": pair.free.text,
    "--badge-free-border": pair.free.border,
    "--badge-free-glow": pair.free.glow || "transparent",
  };
};

// Badge CSS Classes
export const BADGE_CSS_CLASSES = {
  base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200",

  pro: "bg-[var(--badge-pro-background)] text-[var(--badge-pro-text)] border-[var(--badge-pro-border)] shadow-sm hover:shadow-[0_0_0_1px_var(--badge-pro-glow)]",

  free: "bg-[var(--badge-free-background)] text-[var(--badge-free-text)] border-[var(--badge-free-border)] shadow-sm hover:shadow-[0_0_0_1px_var(--badge-free-glow)]",

  // Size variations
  sizes: {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  },

  // Style variations
  styles: {
    solid: "", // Default solid style
    outline: "bg-transparent border-2",
    ghost: "bg-transparent border-transparent hover:border-current",
  },
};

// Current Badge Pair (matches existing design)
export const CURRENT_BADGE_PAIR: BadgePair = "red-gold";

// Badge Pair Options for Theme Selector
export const BADGE_PAIR_OPTIONS = Object.values(BADGE_PAIRS).map((pair) => ({
  id: pair.id,
  name: pair.name,
  description: pair.description,
  preview: {
    pro: pair.pro,
    free: pair.free,
  },
}));
