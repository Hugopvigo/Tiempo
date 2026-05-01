import { View, TouchableOpacity } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { useSettingsStore } from "@/stores/cityStore";
import { Wind } from "lucide-react-native";
import { getAQILabel, getAQIDescription, getAQIColor } from "@/types/weather";
import { useState } from "react";
import type { AirQualityData } from "@/types/weather";

interface AirQualityCardProps {
  data: AirQualityData;
}

const AQI_GRADIENT_COLORS = ["#50F0E6", "#50CCAA", "#F0E641", "#FF5050", "#960032", "#7D2181"];

function PollutantBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const { isDark } = useThemeContext();
  const percentage = Math.min((value / max) * 100, 100);
  const barBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <ThemedText secondary style={{ fontSize: 13, width: 36 }}>{label}</ThemedText>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: barBg, overflow: "hidden" }}>
        <View style={{ width: `${percentage}%`, height: "100%", borderRadius: 3, backgroundColor: color }} />
      </View>
      <ThemedText style={{ fontSize: 13, width: 60, textAlign: "right" }}>
        {value.toFixed(1)} {unit}
      </ThemedText>
    </View>
  );
}

function getPollenLabel(value: number): string {
  if (value < 10) return "Bajo";
  if (value < 50) return "Moderado";
  if (value < 200) return "Alto";
  return "Muy alto";
}

function PollenBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const { isDark } = useThemeContext();
  const percentage = Math.min((value / max) * 100, 100);
  const barBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <ThemedText secondary style={{ fontSize: 13, width: 72 }}>{label}</ThemedText>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: barBg, overflow: "hidden" }}>
        <View style={{ width: `${percentage}%`, height: "100%", borderRadius: 3, backgroundColor: color }} />
      </View>
      <ThemedText style={{ fontSize: 13, width: 60, textAlign: "right" }}>
        {getPollenLabel(value)}
      </ThemedText>
    </View>
  );
}

export function AirQualityCard({ data }: AirQualityCardProps) {
  const { isDark } = useThemeContext();
  const { settings } = useSettingsStore();
  const [expanded, setExpanded] = useState(false);
  const isColored = settings.iconStyle === "colored";
  const monoColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  const aqi = data.current.europeanAqi;
  const aqiColor = getAQIColor(aqi);
  const aqiLabel = getAQILabel(aqi);
  const aqiDesc = getAQIDescription(aqi);
  const displayColor = isColored ? aqiColor : monoColor;

  const aqiPercent = Math.min((aqi / 150) * 100, 100);

  return (
    <ThemedCard style={{ marginBottom: 12 }}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Wind size={16} color={displayColor} />
          <ThemedText secondary style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, flex: 1 }}>
            Calidad del Aire
          </ThemedText>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isColored ? `${aqiColor}22` : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"),
            alignItems: "center",
            justifyContent: "center",
          }}>
            <ThemedText style={{ fontSize: 16, fontWeight: "700", color: isColored ? aqiColor : undefined }}>
              {Math.round(aqi)}
            </ThemedText>
          </View>
        </View>

        <View style={{ alignItems: "center", marginBottom: 4 }}>
          <ThemedText style={{ fontSize: 20, fontWeight: "600", color: isColored ? aqiColor : undefined }}>
            {aqiLabel}
          </ThemedText>
          <ThemedText secondary style={{ fontSize: 13, marginTop: 2 }}>
            {aqiDesc}
          </ThemedText>
        </View>

        <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 12, marginBottom: 4 }}>
          {AQI_GRADIENT_COLORS.map((c, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: isColored ? c : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)") }} />
          ))}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ThemedText secondary style={{ fontSize: 10 }}>0</ThemedText>
          <ThemedText secondary style={{ fontSize: 10 }}>100</ThemedText>
          <ThemedText secondary style={{ fontSize: 10 }}>150</ThemedText>
        </View>

        <View style={{ position: "absolute", left: `${Math.min(aqiPercent, 97)}%`, top: 78, width: 2, height: 12, borderRadius: 1, backgroundColor: isColored ? aqiColor : (isDark ? "#FFF" : "#000") }} />

      </TouchableOpacity>

      {expanded && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
          <PollutantBar label="PM2.5" value={data.current.pm25} max={75} unit="µg/m³" color={isColored ? "#FF6B6B" : monoColor} />
          <PollutantBar label="PM10" value={data.current.pm10} max={150} unit="µg/m³" color={isColored ? "#FF9500" : monoColor} />
          <PollutantBar label="O₃" value={data.current.ozone} max={200} unit="µg/m³" color={isColored ? "#34D399" : monoColor} />
          <PollutantBar label="NO₂" value={data.current.nitrogenDioxide} max={200} unit="µg/m³" color={isColored ? "#60A5FA" : monoColor} />

          {(data.current.grassPollen != null || data.current.olivePollen != null || data.current.birchPollen != null) && (
            <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
              <ThemedText secondary style={{ fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Polen
              </ThemedText>
              {data.current.grassPollen != null && (
                <PollenBar label="Gramíneas" value={data.current.grassPollen} max={200} color={isColored ? "#4ADE80" : monoColor} />
              )}
              {data.current.olivePollen != null && (
                <PollenBar label="Olivo" value={data.current.olivePollen} max={400} color={isColored ? "#A3E635" : monoColor} />
              )}
              {data.current.birchPollen != null && (
                <PollenBar label="Abedul" value={data.current.birchPollen} max={400} color={isColored ? "#FCD34D" : monoColor} />
              )}
            </View>
          )}
        </View>
      )}
    </ThemedCard>
  );
}
