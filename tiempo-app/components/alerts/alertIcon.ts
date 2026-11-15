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
