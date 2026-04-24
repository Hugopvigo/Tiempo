import { useContext, createContext } from "react";
import type { ReactNode } from "react";

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children, isDark }: { children: ReactNode; isDark: boolean }) {
  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
