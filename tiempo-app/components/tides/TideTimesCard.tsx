import { View } from "react-native";
import { ThemedCard, ThemedText, useThemeContext } from "@/components/theme";
import type { TideForecast } from "@/types/weather";
import { ArrowUp, ArrowDown } from "lucide-react-native";

interface TideTimesCardProps {
  forecast: TideForecast;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function TideTimesCard({ forecast }: TideTimesCardProps) {
  const { isDark } = useThemeContext();

  const highTides = forecast.tides.filter((t) => t.type === "high");
  const lowTides = forecast.tides.filter((t) => t.type === "low");

  if (highTides.length === 0 && lowTides.length === 0) return null;

  return (
    <ThemedCard>
      <ThemedText
        secondary
        style={{
          fontSize: 13,
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: 12,
          letterSpacing: 0.5,
        }}
      >
        Mareas
      </ThemedText>

      {forecast.coefficient != null && (
        <ThemedText secondary style={{ fontSize: 12, marginBottom: 12 }}>
          Coeficiente: {forecast.coefficient}
        </ThemedText>
      )}

      <View style={{ flexDirection: "row", gap: 16 }}>
        {highTides.length > 0 && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <ArrowUp size={14} color="#34C759" />
              <ThemedText secondary style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase" }}>
                Pleamar
              </ThemedText>
            </View>
            {highTides.map((t, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                <ThemedText style={{ fontSize: 15, fontWeight: "500" }}>
                  {formatTime(t.time)}
                </ThemedText>
                <ThemedText secondary style={{ fontSize: 14 }}>
                  {t.height.toFixed(2)} m
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {lowTides.length > 0 && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <ArrowDown size={14} color="#FF9500" />
              <ThemedText secondary style={{ fontSize: 12, fontWeight: "600", textTransform: "uppercase" }}>
                Bajamar
              </ThemedText>
            </View>
            {lowTides.map((t, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                <ThemedText style={{ fontSize: 15, fontWeight: "500" }}>
                  {formatTime(t.time)}
                </ThemedText>
                <ThemedText secondary style={{ fontSize: 14 }}>
                  {t.height.toFixed(2)} m
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        style={{
          marginTop: 10,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        }}
      >
        <ThemedText secondary style={{ fontSize: 11, lineHeight: 16 }}>
          Datos estimados por modelo numérico. No apto para navegación costera.
        </ThemedText>
      </View>
    </ThemedCard>
  );
}
