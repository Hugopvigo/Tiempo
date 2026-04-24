import { View } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { DailyForecast } from "@/types/weather";
import { memo } from "react";

interface DailyForecastProps {
  daily: DailyForecast[];
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const DayRow = memo(function DayRow({ d, index, isDark }: { d: DailyForecast; index: number; isDark: boolean }) {
  const dayLabel = index === 0 ? "Hoy" : DAYS[new Date(d.date + "T12:00:00").getDay()];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: index > 0 ? 0.5 : 0,
        borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      }}
    >
      <ThemedText style={{ fontSize: 17, width: 52, fontWeight: index === 0 ? "600" : "400" }}>
        {dayLabel}
      </ThemedText>

      <View style={{ width: 36, alignItems: "center" }}>
        <WeatherIcon condition={d.condition} size={20} color="rgba(255,255,255,0.7)" />
      </View>

      {d.precipitationChance > 0 && (
        <ThemedText secondary style={{ fontSize: 13, width: 36, textAlign: "right" }}>
          {d.precipitationChance}%
        </ThemedText>
      )}
      {d.precipitationChance === 0 && <View style={{ width: 36 }} />}

      <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <ThemedText style={{ fontSize: 17, fontWeight: "500" }}>
          {Math.round(d.tempMax)}°
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 17 }}>
          {Math.round(d.tempMin)}°
        </ThemedText>
      </View>
    </View>
  );
});

export function DailyForecastCard({ daily }: DailyForecastProps) {
  const { isDark } = useThemeContext();

  return (
    <ThemedCard style={{ marginBottom: 12 }}>
      <ThemedText
        secondary
        style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}
      >
        Próximos 7 días
      </ThemedText>
      {daily.map((d, i) => (
        <DayRow key={d.date} d={d} index={i} isDark={isDark} />
      ))}
    </ThemedCard>
  );
}
