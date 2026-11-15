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

function whenLabel(d: Date, now: Date): string {
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `las ${time}`;
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `mañana a las ${time}`;
  return `el ${d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}, ${time}`;
}

// "Hasta las 11:00", "Hasta mañana a las 09:00" o, si aún no ha empezado,
// "Desde mañana a las 09:00 hasta el lun 3, 12:00".
export function validityLabel(startIso: string, endIso: string, now: Date = new Date()): string {
  const end = new Date(endIso);
  if (isNaN(end.getTime())) return "";
  const start = new Date(startIso);
  const until = `hasta ${whenLabel(end, now)}`;
  if (!isNaN(start.getTime()) && start.getTime() > now.getTime() + 60 * 60 * 1000) {
    return `Desde ${whenLabel(start, now)} ${until}`;
  }
  return until.charAt(0).toUpperCase() + until.slice(1);
}
