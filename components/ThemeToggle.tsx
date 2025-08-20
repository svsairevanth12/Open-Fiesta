"use client";

import React, { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Palette, Sun, Moon, Type, Grid3X3 } from "lucide-react";
import { useTheme } from "@/lib/themeContext";
import {
  ACCENT_COLORS,
  FONT_FAMILIES,
  BACKGROUND_STYLES,
  type AccentColor,
  type FontFamily,
  type BackgroundStyle,
} from "@/lib/themes";

// Memoized accent option component
const AccentOption = React.memo<{
  accent: {
    id: AccentColor;
    name: string;
    description: string;
    primary: string;
    secondary: string;
    tertiary: string;
  };
  isSelected: boolean;
  onSelect: (id: AccentColor) => void;
}>(({ accent, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(accent.id);
  }, [accent.id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-lg border transition-colors text-left ${
        isSelected
          ? "border-white/30 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-6 h-6 rounded-full border border-white/20"
          style={{ backgroundColor: accent.primary }}
        />
        <div>
          <div className="text-sm font-medium">{accent.name}</div>
          <div className="text-xs text-white/60">{accent.description}</div>
        </div>
      </div>
      <div className="flex gap-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accent.primary }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accent.secondary }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accent.tertiary }}
        />
      </div>
    </button>
  );
});

AccentOption.displayName = "AccentOption";

// Memoized font option component
const FontOption = React.memo<{
  font: { id: FontFamily; name: string; description: string };
  isSelected: boolean;
  onSelect: (id: FontFamily) => void;
}>(({ font, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(font.id);
  }, [font.id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 rounded-lg border transition-colors text-left ${
        isSelected
          ? "border-white/30 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium">{font.name}</div>
          <div className="text-xs text-white/60">{font.description}</div>
        </div>
        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
      <div
        className={`text-sm text-white/80 font-preview font-preview-${font.id}`}
      >
        The quick brown fox jumps over the lazy dog 123456
      </div>
    </button>
  );
});

FontOption.displayName = "FontOption";

// Memoized background option component
const BackgroundOption = React.memo<{
  background: {
    id: BackgroundStyle;
    name: string;
    description: string;
    className: string;
  };
  isSelected: boolean;
  onSelect: (id: BackgroundStyle) => void;
}>(({ background, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(background.id);
  }, [background.id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-lg border transition-colors text-left ${
        isSelected
          ? "border-white/30 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">{background.name}</div>
          <div className="text-xs text-white/60">{background.description}</div>
        </div>
        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
      <div
        className={`w-full h-16 rounded border border-white/20 ${background.className}`}
      />
    </button>
  );
});

BackgroundOption.displayName = "BackgroundOption";

export default function ThemeToggle() {
  const { theme, setAccent, setFont, setBackground, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"accent" | "font" | "background">(
    "accent"
  );

  // Memoize the arrays to prevent recreating on every render
  const accentValues = useMemo(() => Object.values(ACCENT_COLORS), []);
  const fontValues = useMemo(() => Object.values(FONT_FAMILIES), []);
  const backgroundValues = useMemo(() => Object.values(BACKGROUND_STYLES), []);

  // Memoized handlers
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleToggleMode = useCallback(() => toggleMode(), [toggleMode]);

  const handleAccentChange = useCallback(
    (accent: AccentColor) => {
      setAccent(accent);
    },
    [setAccent]
  );

  const handleFontChange = useCallback(
    (font: FontFamily) => {
      console.log("Font change requested:", font);
      try {
        setFont(font);
      } catch (error) {
        console.error("Font change error:", error);
      }
    },
    [setFont]
  );

  const handleBackgroundChange = useCallback(
    (background: BackgroundStyle) => {
      setBackground(background);
    },
    [setBackground]
  );

  const handleTabChange = useCallback(
    (tab: "accent" | "font" | "background") => {
      setActiveTab(tab);
    },
    []
  );

  // Memoized current theme info
  const currentAccent = useMemo(
    () => ACCENT_COLORS[theme.accent],
    [theme.accent]
  );
  const currentFont = useMemo(() => FONT_FAMILIES[theme.font], [theme.font]);
  const currentBackground = useMemo(
    () => BACKGROUND_STYLES[theme.background],
    [theme.background]
  );

  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 shadow transition-colors"
        title="Theme Settings"
      >
        <Palette size={14} />
        <span>Theme</span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={handleClose}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Theme Settings"
              className="relative w-full mx-3 sm:mx-6 max-w-2xl lg:max-w-3xl max-h-[88vh] rounded-2xl border border-white/10 bg-zinc-900/95 text-white p-5 md:p-6 lg:p-7 shadow-2xl backdrop-blur-sm z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  Theme Settings
                </h2>
                <button
                  aria-label="Close"
                  onClick={handleClose}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Mode Toggle */}
              <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dark/Light Mode</span>
                  <button
                    onClick={handleToggleMode}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    {theme.mode === "dark" ? (
                      <Moon size={14} />
                    ) : (
                      <Sun size={14} />
                    )}
                    <span className="text-sm capitalize">{theme.mode}</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/5 shrink-0">
                {[
                  { id: "accent" as const, label: "Colors", icon: Palette },
                  { id: "font" as const, label: "Fonts", icon: Type },
                  {
                    id: "background" as const,
                    label: "Backgrounds",
                    icon: Grid3X3,
                  },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === id
                        ? "bg-white/15 text-white border border-white/20"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content (scrollable) */}
              <div className="min-h-[200px] flex-1 overflow-y-auto pr-1 space-y-0">
                {/* Accent Colors Tab */}
                {activeTab === "accent" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 mb-3">
                      Choose your accent color
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {accentValues.map((accent) => (
                        <AccentOption
                          key={accent.id}
                          accent={accent}
                          isSelected={theme.accent === accent.id}
                          onSelect={handleAccentChange}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Font Families Tab */}
                {activeTab === "font" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 mb-3">
                      Choose your font family
                    </h3>
                    <div className="space-y-2">
                      {fontValues.map((font) => (
                        <FontOption
                          key={font.id}
                          font={font}
                          isSelected={theme.font === font.id}
                          onSelect={handleFontChange}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Background Styles Tab */}
                {activeTab === "background" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/80 mb-3">
                      Choose your background style
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {backgroundValues.map((bg) => (
                        <BackgroundOption
                          key={bg.id}
                          background={bg}
                          isSelected={theme.background === bg.id}
                          onSelect={handleBackgroundChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 shrink-0">
                <div className="text-xs text-white/60">
                  Current: {theme.mode} mode, {currentAccent.name},{" "}
                  {currentFont.name}, {currentBackground.name}
                </div>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
