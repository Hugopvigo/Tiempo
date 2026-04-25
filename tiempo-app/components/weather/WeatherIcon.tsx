import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, CloudMoon } from "lucide-react-native";
import type { WeatherCondition } from "@/types/weather";
import type { LucideIcon } from "lucide-react-native";
import { useThemeContext } from "@/components/theme";

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

export function WeatherIcon({ condition, size = 24, color, strokeWidth = 2 }: WeatherIconProps) {
  const { isDark } = useThemeContext();
  const defaultColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.55)";
  const Icon = iconMap[condition] ?? Cloud;
  return <Icon size={size} color={color ?? defaultColor} strokeWidth={strokeWidth} />;
}
