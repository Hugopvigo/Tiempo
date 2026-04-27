import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, CloudMoon } from "lucide-react-native";
import type { WeatherCondition } from "@/types/weather";
import type { LucideIcon } from "lucide-react-native";
import { useThemeContext } from "@/components/theme";
import { useSettingsStore } from "@/stores/cityStore";

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

const colorMap: Record<WeatherCondition, string> = {
  clear: "#FFB800",
  partly_cloudy: "#FFB800",
  cloudy: "#94A3B8",
  rain: "#5AC8FA",
  storm: "#7C3AED",
  snow: "#93C5FD",
  fog: "#94A3B8",
  night_clear: "#FCD34D",
  night_cloudy: "#94A3B8",
};

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  color?: string;
  strokeWidth?: number;
  colored?: boolean;
}

export function WeatherIcon({ condition, size = 24, color, strokeWidth = 2, colored }: WeatherIconProps) {
  const { isDark } = useThemeContext();
  const { settings } = useSettingsStore();
  const defaultColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.55)";
  const useColor = colored ?? (settings.iconStyle === "colored");
  const resolvedColor = color ?? (useColor ? colorMap[condition] : defaultColor);
  const Icon = iconMap[condition] ?? Cloud;
  return <Icon size={size} color={resolvedColor} strokeWidth={strokeWidth} />;
}
