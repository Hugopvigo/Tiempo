import { View } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { Droplets, Wind, Eye, Thermometer, Gauge, Sun } from "lucide-react-native";
import { useThemeContext } from "@/components/theme";
import { windDirectionLabel } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";
import { memo } from "react";

const detailColorMap: Record<string, string> = {
  sensation: "#FF6B6B",
  humidity: "#5AC8FA",
  wind: "#34D399",
  uv: "#FFB800",
  pressure: "#A78BFA",
  visibility: "#60A5FA",
};

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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <ThemedCard style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 18, minHeight: 140, alignItems: "center", justifyContent: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
        {icon}
        <ThemedText secondary style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText style={{ fontSize: 28, fontWeight: "500", textAlign: "center" }}>
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText secondary style={{ fontSize: 14, marginTop: 4, textAlign: "center" }}>
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
  const { settings } = useSettingsStore();
  const monoColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const isColored = settings.iconStyle === "colored";

  const ic = (key: string, Icon: any) => <Icon size={14} color={isColored ? detailColorMap[key] : monoColor} />;

  return (
    <View style={{ gap: 12, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={ic("sensation", Thermometer)}
          label="Sensación"
          value={`${Math.round(feelsLike)}°`}
          subtitle={feelsLike > feelsLike + 2 ? "Más cálido" : feelsLike < feelsLike - 2 ? "Más frío" : "Similar a la real"}
        />
        <DetailTile
          icon={ic("humidity", Droplets)}
          label="Humedad"
          value={`${Math.round(humidity)}%`}
          subtitle={humidity > 70 ? "Alta" : humidity > 40 ? "Moderada" : "Baja"}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={ic("wind", Wind)}
          label="Viento"
          value={`${Math.round(windSpeed)} km/h`}
          subtitle={`Dirección ${windDirectionLabel(windDirection)}`}
        />
        <DetailTile
          icon={ic("uv", Sun)}
          label="Índice UV"
          value={`${Math.round(uvIndex)}`}
          subtitle={uvLabel(uvIndex)}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <DetailTile
          icon={ic("pressure", Gauge)}
          label="Presión"
          value={`${Math.round(pressure)} hPa`}
        />
        <DetailTile
          icon={ic("visibility", Eye)}
          label="Visibilidad"
          value={visibility >= 1000 ? `${(visibility / 1000).toFixed(1)} km` : `${Math.round(visibility)} m`}
          subtitle={visibility >= 10000 ? "Excelente" : visibility >= 5000 ? "Buena" : "Reducida"}
        />
      </View>
    </View>
  );
}
