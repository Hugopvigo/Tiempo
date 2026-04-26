import { View } from "react-native";
import { ThemedCard, ThemedText, useThemeContext } from "@/components/theme";
import type { MarineData } from "@/types/weather";
import { windDirectionLabel } from "@/constants/weather";

interface TideTableProps {
  data: MarineData;
}

export function TideTable({ data }: TideTableProps) {
  const { isDark } = useThemeContext();

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
        Previsión 7 días
      </ThemedText>

      <View
        style={{
          flexDirection: "row",
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
<ThemedText secondary style={{ flex: 1.2, fontSize: 12, fontWeight: "600" }}>
        Día
      </ThemedText>
      <ThemedText secondary style={{ flex: 1, fontSize: 12, fontWeight: "600", textAlign: "center" }}>
        Oleaje
      </ThemedText>
      <ThemedText secondary style={{ flex: 1, fontSize: 12, fontWeight: "600", textAlign: "center" }}>
        Dir
      </ThemedText>
      <ThemedText secondary style={{ flex: 1, fontSize: 12, fontWeight: "600", textAlign: "center" }}>
        Periodo
        </ThemedText>
      </View>

      {data.daily.date.map((date, i) => {
        const d = new Date(date + "T12:00");
        const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
        const dayNum = d.getDate();
        const isToday =
          new Date(date).toDateString() === new Date().toDateString();

        return (
          <View
            key={date}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: i < data.daily.date.length - 1 ? 1 : 0,
              borderBottomColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            }}
          >
            <ThemedText
              style={{ flex: 1.2, fontSize: 14, fontWeight: isToday ? "600" : "400" }}
            >
              {isToday ? "Hoy" : `${dayName} ${dayNum}`}
            </ThemedText>
            <ThemedText
              style={{ flex: 1, fontSize: 14, textAlign: "center" }}
            >
              {data.daily.waveHeightMax[i]?.toFixed(1) ?? "—"} m
            </ThemedText>
            <ThemedText
              secondary
              style={{ flex: 1, fontSize: 14, textAlign: "center" }}
            >
              {data.daily.waveDirectionDominant[i] != null
                ? windDirectionLabel(data.daily.waveDirectionDominant[i])
                : "—"}
            </ThemedText>
            <ThemedText
              secondary
              style={{ flex: 1, fontSize: 14, textAlign: "center" }}
            >
              {data.daily.wavePeriodMax[i]?.toFixed(0) ?? "—"} s
            </ThemedText>
          </View>
        );
      })}
    </ThemedCard>
  );
}
