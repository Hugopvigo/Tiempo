import type { WeatherCondition } from "@/types/weather";

type GradientPair = [string, string];

interface ThemeGradients {
  light: Record<WeatherCondition, GradientPair>;
  dark: Record<WeatherCondition, GradientPair>;
}

export const themeGradients: ThemeGradients = {
  light: {
    clear: ["#FFC86B", "#FFDAB9"],      // Atardecer/Día claro cálido
    partly_cloudy: ["#82C1FF", "#BEE3F8"], // Azul cielo suave
    cloudy: ["#E2E8F0", "#CBD5E0"],      // Gris azulado claro
    rain: ["#90CDF4", "#A3BFFA"],        // Lluvia suave/azulada
    storm: ["#BEE3F8", "#90CDF4"],       // Tormenta (más claro para contraste)
    snow: ["#EDF2F7", "#E2E8F0"],        // Nieve muy suave
    fog: ["#CBD5E0", "#E2E8F0"],         // Niebla clara
    night_clear: ["#E2E8F0", "#CBD5E0"], // Noche clara (Grisáceo muy suave)
    night_cloudy: ["#CBD5E0", "#A0AEC0"], // Noche nublada (Gris suave)
  },
  dark: {
    clear: ["#1A202C", "#2D3748"],      // Noche profunda
    partly_cloudy: ["#2D3748", "#1A202C"],
    cloudy: ["#171923", "#2D3748"],
    rain: ["#1A365D", "#2A4365"],
    storm: ["#171923", "#2C5282"],
    snow: ["#2D3748", "#4A5568"],
    fog: ["#2D3748", "#1A202C"],
    night_clear: ["#0F172A", "#1E293B"], // Noche premium
    night_cloudy: ["#1E293B", "#334155"],
  },
};

export const cardBackground = {
  light: "rgba(255, 255, 255, 0.7)",
  dark: "rgba(30, 41, 59, 0.4)",
};

export const cardBorder = {
  light: "rgba(255, 255, 255, 0.3)",
  dark: "rgba(255, 255, 255, 0.05)",
};

export const textColor = {
  light: "#1A202C",
  dark: "#F8FAFC",
};

export const secondaryTextColor = {
  light: "#4A5568",
  dark: "#94A3B8",
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
