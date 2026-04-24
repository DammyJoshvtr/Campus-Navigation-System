/**
 * ThemeContext.tsx
 *
 * Provides dark mode + app settings across the entire app.
 * Persisted to AsyncStorage so the preference survives restarts.
 *
 * Usage:
 *   const { isDark, theme, toggle } = useTheme();
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Palette ─────────────────────────────────────────────────────────────────

export const palette = {
  light: {
    bg:              "#F0F6FF",
    surface:         "#FFFFFF",
    surfaceAlt:      "#F1F5F9",
    border:          "#E2E8F0",
    text:            "#0F172A",
    textSecondary:   "#475569",
    textMuted:       "#94A3B8",
    primary:         "#2563EB",
    primaryFg:       "#FFFFFF",
    tabBar:          "#FFFFFF",
    tabBarBorder:    "#E2E8F0",
    searchBg:        "#F1F5F9",
    card:            "#FFFFFF",
    shadow:          "rgba(0,0,0,0.08)",
    statusBar:       "dark-content" as const,
    routeColor:      "#2563EB",
    inputBorder:     "#E2E8F0",
  },
  dark: {
    bg:              "#0B1120",
    surface:         "#131C2E",
    surfaceAlt:      "#1A2540",
    border:          "#1E2D45",
    text:            "#F1F5F9",
    textSecondary:   "#94A3B8",
    textMuted:       "#475569",
    primary:         "#3B82F6",
    primaryFg:       "#FFFFFF",
    tabBar:          "#0B1120",
    tabBarBorder:    "#1E2D45",
    searchBg:        "#1A2540",
    card:            "#131C2E",
    shadow:          "rgba(0,0,0,0.4)",
    statusBar:       "light-content" as const,
    routeColor:      "#60A5FA",
    inputBorder:     "#1E2D45",
  },
} as const;

export type Theme = typeof palette.light;

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemeCtx = {
  isDark: boolean;
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  isDark:  false,
  theme:   palette.light,
  toggle:  () => {},
});

const STORAGE_KEY = "@campus_dark_mode";

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "true") setIsDark(true);
    });
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const theme = isDark ? palette.dark : palette.light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useTheme = () => useContext(ThemeContext);
