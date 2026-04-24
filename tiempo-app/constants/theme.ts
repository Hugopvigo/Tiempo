import type { WeatherCondition } from "@/types/weather";

type GradientPair = [string, string];

interface ThemeGradients {
  light: Record<WeatherCondition, GradientPair>;
  dark: Record<WeatherCondition, GradientPair>;
}

export const themeGradients: ThemeGradients = {
  light: {
    clear: ["#FF8E3C", "#FFD700"], // Naranja vibrante a Oro
    partly_cloudy: ["#4facfe", "#00f2fe"], // Azul cielo brillante
    cloudy: ["#A1C4FD", "#C2E9FB"], // Azul suave (no gris)
    rain: ["#48C6EF", "#6F86D6"], // Azul aqua a azul real
    storm: ["#1e3c72", "#2a5298"], // Azul profundo eléctrico
    snow: ["#E0C3FC", "#8EC5FC"], // Lavanda a azul hielo
    fog: ["#74ABE2", "#557353"], // Niebla con toque orgánico
    night_clear: ["#243B55", "#141E30"], // Azul espacial
    night_cloudy: ["#3D3393", "#2B0548"], // Púrpura cósmico
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
  light: "rgba(255, 255, 255, 0.22)", // Un poco más transparente para ver el degradado
  dark: "rgba(0, 0, 0, 0.25)",
};

export const cardBorder = {
  light: "rgba(255, 255, 255, 0.4)", // Borde brillante para efecto cristal
  dark: "rgba(255, 255, 255, 0.1)",
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
