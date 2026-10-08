import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createTheme } from "@mui/material";

const THEME_KEY = "pharmacy-theme-v1";
const DEFAULT_MODE = "light";

const sharedPalette = {
  primary: { main: "#0f766e", light: "#ccfbf1", dark: "#115e59" },
  secondary: { main: "#0891b2", light: "#cffafe", dark: "#155e75" },
  success: { main: "#16a34a", light: "#dcfce7", dark: "#15803d" },
  warning: { main: "#d97706", light: "#fef3c7", dark: "#b45309" },
  error: { main: "#dc2626", light: "#fee2e2", dark: "#b91c1c" },
  info: { main: "#2563eb", light: "#dbeafe", dark: "#1d4ed8" },
};

function readMode() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_MODE;
}

export function buildAppTheme(mode) {
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      ...sharedPalette,
      ...(isDark
        ? {
            primary: { main: "#2dd4bf", light: "#115e59", dark: "#99f6e4" },
            secondary: { main: "#22d3ee", light: "#155e75", dark: "#a5f3fc" },
            background: { default: "#0f1419", paper: "#1a222c" },
          }
        : {
            background: { default: "#f6f8f9", paper: "#ffffff" },
          }),
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
      h5: { letterSpacing: "-0.02em" },
    },
  });
}

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readMode());
  }, []);

  const setMode = useCallback((next) => {
    const value = next === "dark" ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      /* ignore */
    }
    setModeState(value);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeModeProvider");
  return ctx;
}
