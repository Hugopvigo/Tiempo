import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, CloudMoon } from "lucide-react-native";
import type { WeatherCondition } from "@/types/weather";
import type { LucideIcon } from "lucide-react-native";

const iconMap: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  fog: CloudFog,
  night_clear: Moon,
  night_cloudy: CloudMoon,
};

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function WeatherIcon({ condition, size = 24, color = "#FFFFFF", strokeWidth = 2 }: WeatherIconProps) {
  const Icon = iconMap[condition] ?? Cloud;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
