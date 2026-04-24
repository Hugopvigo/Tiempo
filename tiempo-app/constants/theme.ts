import type { WeatherCondition } from "@/types/weather";

type GradientPair = [string, string];

interface ThemeGradients {
  light: Record<WeatherCondition, GradientPair>;
  dark: Record<WeatherCondition, GradientPair>;
}

export const themeGradients: ThemeGradients = {
  light: {
    clear: ["#FF9500", "#FFCC00"],
    partly_cloudy: ["#5AC8FA", "#B2EBF2"],
    cloudy: ["#8E8E93", "#C7C7CC"],
    rain: ["#546E7A", "#90A4AE"],
    storm: ["#37474F", "#607D8B"],
    snow: ["#E0E0E0", "#F5F5F5"],
    fog: ["#B0BEC5", "#CFD8DC"],
    night_clear: ["#0D1B2A", "#1B2838"],
    night_cloudy: ["#1A1A2E", "#2D2D44"],
  },
  dark: {
    clear: ["#1A237E", "#283593"],
    partly_cloudy: ["#1A2940", "#2C3E50"],
    cloudy: ["#1C1C1E", "#2C2C2E"],
    rain: ["#0D1117", "#1B2838"],
    storm: ["#0A0A0A", "#1A1A2E"],
    snow: ["#1C1C1E", "#3A3A3C"],
    fog: ["#1A1A2E", "#2C2C2E"],
    night_clear: ["#000000", "#0D1B2A"],
    night_cloudy: ["#0A0A0A", "#1A1A2E"],
  },
};

export const cardBackground = {
  light: "rgba(255, 255, 255, 0.25)",
  dark: "rgba(0, 0, 0, 0.3)",
};

export const textColor = {
  light: "#1C1C1E",
  dark: "#FFFFFF",
};

export const secondaryTextColor = {
  light: "rgba(0, 0, 0, 0.6)",
  dark: "rgba(255, 255, 255, 0.6)",
};

export const alertColors = {
  yellow: "#FFD600",
  orange: "#FF9500",
  red: "#FF3B30",
} as const;
