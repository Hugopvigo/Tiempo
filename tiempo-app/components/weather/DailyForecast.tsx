import { View, TouchableOpacity } from "react-native";
import { ThemedCard, ThemedText , useThemeContext } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { DailyForecast } from "@/types/weather";
import { formatTemperature } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";
import { memo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface DailyForecastProps {
  daily: DailyForecast[];
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const DayRow = memo(function DayRow({ d, index, isDark, unit }: { d: DailyForecast; index: number; isDark: boolean; unit: "celsius" | "fahrenheit" }) {
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
        <WeatherIcon condition={d.condition} size={20} />
      </View>

      {d.precipitationChance > 0 && (
        <ThemedText secondary style={{ fontSize: 13, width: 36, textAlign: "right" }}>
          {d.precipitationChance}%
        </ThemedText>
      )}
      {d.precipitationChance === 0 && <View style={{ width: 36 }} />}

      <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <ThemedText style={{ fontSize: 17, fontWeight: "500" }}>
          {formatTemperature(d.tempMax, unit)}
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 17 }}>
          {formatTemperature(d.tempMin, unit)}
        </ThemedText>
      </View>
    </View>
  );
});

const VISIBLE_DAYS = 4;

export function DailyForecastCard({ daily }: DailyForecastProps) {
  const { isDark } = useThemeContext();
  const { settings } = useSettingsStore();
  const [expanded, setExpanded] = useState(false);
  const hasMore = daily.length > VISIBLE_DAYS;
  const visibleDays = expanded ? daily : daily.slice(0, VISIBLE_DAYS);
  const monoColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <ThemedCard style={{ marginBottom: 12, paddingHorizontal: 20, paddingVertical: 18 }}>
      <TouchableOpacity onPress={() => hasMore && setExpanded(!expanded)} activeOpacity={0.7}>
        <ThemedText
          secondary
          style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12, letterSpacing: 0.5 }}
        >
          Próximos 7 días
        </ThemedText>
        {visibleDays.map((d, i) => (
          <DayRow key={d.date} d={d} index={i} isDark={isDark} unit={settings.temperatureUnit} />
        ))}
      </TouchableOpacity>
      {hasMore && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 6, gap: 4 }}>
          <ThemedText secondary style={{ fontSize: 13 }}>
            {expanded ? "Menos" : "Más"}
          </ThemedText>
          {expanded ? <ChevronUp size={16} color={monoColor} /> : <ChevronDown size={16} color={monoColor} />}
        </TouchableOpacity>
      )}
    </ThemedCard>
  );
}
