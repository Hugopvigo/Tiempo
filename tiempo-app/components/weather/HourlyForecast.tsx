import { View, ScrollView } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { HourlyForecast } from "@/types/weather";
import { memo } from "react";

interface HourlyForecastProps {
  hourly: HourlyForecast[];
}

const HourItem = memo(function HourItem({ h }: { h: HourlyForecast }) {
  const hour = new Date(h.time).getHours();
  const label = hour === 0 ? "0" : `${hour}`;

  return (
    <View style={{ alignItems: "center", width: 64, gap: 6, paddingVertical: 4 }}>
      <ThemedText secondary style={{ fontSize: 13 }}>
        {label}
      </ThemedText>
      <WeatherIcon condition={h.condition} size={22} />
      <ThemedText style={{ fontSize: 17, fontWeight: "500" }}>
        {Math.round(h.temperature)}°
      </ThemedText>
      {h.precipitationChance > 0 && (
        <ThemedText secondary style={{ fontSize: 11 }}>
          {h.precipitationChance}%
        </ThemedText>
      )}
    </View>
  );
});

export function HourlyForecastCard({ hourly }: HourlyForecastProps) {
  return (
    <ThemedCard style={{ marginBottom: 12, paddingHorizontal: 20, paddingVertical: 18 }}>
      <ThemedText
        secondary
        style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 14, letterSpacing: 0.5 }}
      >
        Previsión horaria
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {hourly.slice(0, 25).map((h, i) => (
          <HourItem key={`${h.time}-${i}`} h={h} />
        ))}
      </ScrollView>
    </ThemedCard>
  );
}
