import { View } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { Droplets, Wind, Eye, Thermometer, Gauge, Sun } from "lucide-react-native";
import { useThemeContext } from "@/components/theme";
import { windDirectionLabel } from "@/constants/weather";
import { memo } from "react";

interface WeatherDetailsProps {
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Bajo";
  if (uv <= 5) return "Moderado";
  if (uv <= 7) return "Alto";
  if (uv <= 10) return "Muy alto";
  return "Extremo";
}

const DetailTile = memo(function DetailTile({
  icon,
  label,
  value,
  subtitle,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconColor?: string;
}) {
  const { isDark } = useThemeContext();
  const defaultColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <ThemedCard style={{ flex: 1, padding: 14, minHeight: 140 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
        {icon}
        <ThemedText secondary style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText style={{ fontSize: 26, fontWeight: "500" }}>
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText secondary style={{ fontSize: 14, marginTop: 2 }}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedCard>
  );
});

export function WeatherDetails({
  feelsLike,
  humidity,
  windSpeed,
  windDirection,
  uvIndex,
  pressure,
  visibility,
}: WeatherDetailsProps) {
  const { isDark } = useThemeContext();
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <View style={{ gap: 12, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={<Thermometer size={14} color={iconColor} />}
          label="Sensación"
          value={`${Math.round(feelsLike)}°`}
          subtitle={feelsLike > feelsLike + 2 ? "Más cálido" : feelsLike < feelsLike - 2 ? "Más frío" : "Similar a la real"}
          iconColor={iconColor}
        />
        <DetailTile
          icon={<Droplets size={14} color={iconColor} />}
          label="Humedad"
          value={`${Math.round(humidity)}%`}
          subtitle={humidity > 70 ? "Alta" : humidity > 40 ? "Moderada" : "Baja"}
          iconColor={iconColor}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={<Wind size={14} color={iconColor} />}
          label="Viento"
          value={`${Math.round(windSpeed)} km/h`}
          subtitle={`Dirección ${windDirectionLabel(windDirection)}`}
          iconColor={iconColor}
        />
        <DetailTile
          icon={<Sun size={14} color={iconColor} />}
          label="Índice UV"
          value={`${Math.round(uvIndex)}`}
          subtitle={uvLabel(uvIndex)}
          iconColor={iconColor}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={<Gauge size={14} color={iconColor} />}
          label="Presión"
          value={`${Math.round(pressure)} hPa`}
          iconColor={iconColor}
        />
        <DetailTile
          icon={<Eye size={14} color={iconColor} />}
          label="Visibilidad"
          value={visibility >= 1000 ? `${(visibility / 1000).toFixed(1)} km` : `${Math.round(visibility)} m`}
          subtitle={visibility >= 10000 ? "Excelente" : visibility >= 5000 ? "Buena" : "Reducida"}
          iconColor={iconColor}
        />
      </View>
    </View>
  );
}
