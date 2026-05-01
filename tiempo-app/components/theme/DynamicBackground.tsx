import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "./ThemeProvider";
import { themeGradients } from "@/constants/theme";
import type { WeatherCondition } from "@/types/weather";
import type { ReactNode } from "react";

const GRADIENT_START = { x: 0, y: 0 } as const;
const GRADIENT_END = { x: 1, y: 1 } as const;

interface DynamicBackgroundProps {
  condition: WeatherCondition;
  children: ReactNode;
}

export function DynamicBackground({ condition, children }: DynamicBackgroundProps) {
  const { isDark } = useThemeContext();
  const mode = isDark ? "dark" : "light";
  const [color1, color2] = themeGradients[mode][condition];

  return (
    <LinearGradient
      colors={[color1, color2]}
      style={{ flex: 1 }}
      start={GRADIENT_START}
      end={GRADIENT_END}
    >
      {children}
    </LinearGradient>
  );
}
