import type { WeatherCondition } from "@/types/weather";

// Tabla WMO 4677 tal y como la publica Open-Meteo (open-meteo.com/en/docs,
// "WMO Weather interpretation codes"). Explícita para que no vuelva a pasar lo
// de la v4.6.1: los rangos 60-69 y 70-79 estaban intercambiados y la lluvia
// salía como nieve. Los códigos de lluvia/llovizna helada (56, 57, 66, 67) van
// como lluvia: en el suelo es agua, no nieve.
const WMO_CONDITION: Record<number, Exclude<WeatherCondition, "night_clear" | "night_cloudy">> = {
  0: "clear",
  1: "partly_cloudy",
  2: "partly_cloudy",
  3: "cloudy",
  45: "fog",
  48: "fog",
  51: "rain",
  53: "rain",
  55: "rain",
  56: "rain",
  57: "rain",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "rain",
  67: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "storm",
  96: "storm",
  97: "storm",
  99: "storm",
};

export const weatherCodeToCondition = (code: number, isDay: boolean): WeatherCondition => {
  const condition = WMO_CONDITION[code] ?? "cloudy";
  if (!isDay && condition === "clear") return "night_clear";
  if (!isDay && (condition === "partly_cloudy" || condition === "cloudy")) return "night_cloudy";
  return condition;
};
export const conditionToDescription: Record<WeatherCondition, string> = {
  clear: "Despejado",
  partly_cloudy: "Parcialmente nublado",
  cloudy: "Nublado",
  rain: "Lluvia",
  storm: "Tormenta",
  snow: "Nieve",
  fog: "Niebla",
  night_clear: "Noche despejada",
  night_cloudy: "Noche nublada",
};

export const conditionToIcon: Record<WeatherCondition, string> = {
  clear: "sun",
  partly_cloudy: "cloud-sun",
  cloudy: "cloud",
  rain: "cloud-rain",
  storm: "cloud-lightning",
  snow: "snowflake",
  fog: "cloud-fog",
  night_clear: "moon",
  night_cloudy: "cloud-moon",
};

export const windDirectionLabel = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const formatTemperature = (temp: number, unit: "celsius" | "fahrenheit"): string => {
  if (unit === "fahrenheit") return `${Math.round(temp * 9 / 5 + 32)}°`;
  return `${Math.round(temp)}°`;
};
