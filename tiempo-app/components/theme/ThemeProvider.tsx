import { useContext, createContext, useMemo } from "react";
import type { ReactNode } from "react";

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children, isDark }: { children: ReactNode; isDark: boolean }) {
  const value = useMemo(() => ({ isDark }), [isDark]);
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
