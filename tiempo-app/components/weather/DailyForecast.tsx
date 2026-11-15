import { View, TouchableOpacity, type DimensionValue } from "react-native";
import { ThemedCard, ThemedText, CardTitle, useThemeContext } from "@/components/theme";
import { rainColor, trackColor, textColor } from "@/constants/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { DailyForecast } from "@/types/weather";
import { formatTemperature } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";
import { memo, useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react-native";

const pct = (v: number): DimensionValue => `${v}%` as DimensionValue;

interface DailyForecastProps {
  daily: DailyForecast[];
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const DayRow = memo(function DayRow({
  d, index, isDark, unit, allMin, range
}: {
  d: DailyForecast; index: number; isDark: boolean;
  unit: "celsius" | "fahrenheit";
  allMin: number; range: number;
}) {
  const dayLabel = index === 0 ? "Hoy" : DAYS[new Date(d.date + "T12:00:00").getDay()];

  const barLeft = range > 0 ? ((d.tempMin - allMin) / range) * 100 : 0;
  const rawBarWidth = range > 0 ? ((d.tempMax - d.tempMin) / range) * 100 : 4;
  const barWidth = Math.min(Math.max(rawBarWidth, 4), 100 - barLeft);

  const trackBg = isDark ? trackColor.dark : trackColor.light;
  const barColor = isDark ? textColor.dark : textColor.light;
  const rain = isDark ? rainColor.dark : rainColor.light;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        minHeight: 44,
        gap: 8,
        borderTopWidth: index > 0 ? 0.5 : 0,
        borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      }}
    >
      <ThemedText style={{ fontSize: 16, fontWeight: "600", width: 44 }}>
        {dayLabel}
      </ThemedText>

      <View style={{ width: 24, alignItems: "center" }}>
        <WeatherIcon condition={d.condition} size={20} />
      </View>

      {d.precipitationChance > 0 ? (
        <ThemedText style={{ fontSize: 13, width: 36, textAlign: "right", color: rain, fontWeight: "600" }}>
          {d.precipitationChance}%
        </ThemedText>
      ) : (
        <View style={{ width: 36 }} />
      )}

      <ThemedText secondary style={{ fontSize: 16, width: 38, textAlign: "right" }}>
        {formatTemperature(d.tempMin, unit)}
      </ThemedText>

      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: trackBg }}>
        <View
          style={{
            position: "absolute",
            left: pct(barLeft),
            width: pct(barWidth),
            top: 0,
            bottom: 0,
            borderRadius: 3,
            backgroundColor: barColor,
          }}
        />
      </View>

      <ThemedText style={{ fontSize: 16, fontWeight: "600", width: 38, textAlign: "right" }}>
        {formatTemperature(d.tempMax, unit)}
      </ThemedText>
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

  const { allMin, range } = useMemo(() => {
    if (daily.length === 0) return { allMin: 0, range: 1 };
    const allMin = Math.min(...daily.map(d => d.tempMin));
    const allMax = Math.max(...daily.map(d => d.tempMax));
    const range = Math.max(allMax - allMin, 1);
    return { allMin, range };
  }, [daily]);

  return (
    <ThemedCard style={{ paddingBottom: 8 }}>
      <TouchableOpacity onPress={() => hasMore && setExpanded(!expanded)} activeOpacity={0.7}>
        <CardTitle aside="Lluvia y temperaturas">{`Próximos ${daily.length} días`}</CardTitle>
        {visibleDays.map((d, i) => (
          <DayRow
            key={d.date}
            d={d}
            index={i}
            isDark={isDark}
            unit={settings.temperatureUnit}
            allMin={allMin}
            range={range}
          />
        ))}
      </TouchableOpacity>
      {hasMore && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", minHeight: 44, gap: 4 }}
        >
          <ThemedText secondary style={{ fontSize: 13 }}>
            {expanded ? "Ver menos días" : "Ver más días"}
          </ThemedText>
          {expanded ? <ChevronUp size={16} color={monoColor} /> : <ChevronDown size={16} color={monoColor} />}
        </TouchableOpacity>
      )}
    </ThemedCard>
  );
}
