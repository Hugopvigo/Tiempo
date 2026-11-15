import { CloudRain, CloudLightning, Snowflake, Wind, ThermometerSun, ThermometerSnowflake, Waves, CloudFog } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { WeatherAlert } from "@/types/weather";

// Un icono por fenómeno: el triángulo genérico no decía de qué iba el aviso.
export const ALERT_ICON: Record<WeatherAlert["type"], LucideIcon> = {
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  wind: Wind,
  heat: ThermometerSun,
  cold: ThermometerSnowflake,
  coastal: Waves,
  fog: CloudFog,
};

export function severityLabel(s: WeatherAlert["severity"]): string {
  switch (s) {
    case "red": return "Rojo";
    case "orange": return "Naranja";
    case "yellow": return "Amarillo";
  }
}

// "Hasta las 11:00" si acaba hoy; "Hasta mañana 09:00" o "Hasta el lun 09:00" si no.
export function validityLabel(endIso: string, now: Date = new Date()): string {
  const end = new Date(endIso);
  if (isNaN(end.getTime())) return "";
  const time = end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const sameDay = end.toDateString() === now.toDateString();
  if (sameDay) return `Hasta las ${time}`;
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (end.toDateString() === tomorrow.toDateString()) return `Hasta mañana a las ${time}`;
  const day = end.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
  return `Hasta el ${day}, ${time}`;
}
