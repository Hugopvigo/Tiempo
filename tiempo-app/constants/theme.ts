import type { WeatherCondition } from "@/types/weather";

type GradientPair = [string, string];

interface ThemeGradients {
  light: Record<WeatherCondition, GradientPair>;
  dark: Record<WeatherCondition, GradientPair>;
}

export const themeGradients: ThemeGradients = {
  light: {
    clear: ["#FF9A3C", "#FFCF4A"],
    partly_cloudy: ["#5EB5F7", "#3AA0E8"],
    cloudy: ["#A8C8E8", "#C5DCF0"],
    rain: ["#4CA8E0", "#6B8FD6"],
    storm: ["#2A5298", "#3A6FCF"],
    snow: ["#D8C0F0", "#A0C8F0"],
    fog: ["#8AB8D8", "#A0C0B0"],
    night_clear: ["#2C4A6E", "#1A2D44"],
    night_cloudy: ["#4A3A90", "#2E1A58"],
  },
  dark: {
    clear: ["#F2994A", "#F2C94C"],
    partly_cloudy: ["#2C3E50", "#4CA1AF"],
    cloudy: ["#1F1C2C", "#928DAB"],
    rain: ["#000046", "#1CB5E0"],
    storm: ["#0F2027", "#2C5364"],
    snow: ["#2980B9", "#6DD5FA"],
    fog: ["#3E5151", "#DECBA4"],
    night_clear: ["#000000", "#434343"],
    night_cloudy: ["#0F0C29", "#302B63"],
  },
};

export const cardBackground = {
  light: "#FFFFFF",
  dark: "rgba(30, 30, 30, 0.6)",
};

export const cardBorder = {
  light: "rgba(0, 0, 0, 0.05)",
  dark: "rgba(255, 255, 255, 0.08)",
};

export const textColor = {
  light: "#2D3748",
  dark: "#FFFFFF",
};

export const secondaryTextColor = {
  light: "#718096",
  dark: "rgba(255, 255, 255, 0.5)",
};

export const screenBackground = {
  light: "#F5F7FA",
  dark: "#000000",
};

export const navBarBackground = {
  light: "#FFFFFF",
  dark: "#0A0A0A",
};

export const alertColors = {
  yellow: "#FFD600",
  orange: "#FF9500",
  red: "#FF3B30",
} as const;
