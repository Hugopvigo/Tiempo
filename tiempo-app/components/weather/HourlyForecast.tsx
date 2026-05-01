import { View, FlatList } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { HourlyForecast } from "@/types/weather";
import { formatTemperature } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";
import { memo, useCallback } from "react";

interface HourlyForecastProps {
  hourly: HourlyForecast[];
}

const HourItem = memo(function HourItem({ h, unit }: { h: HourlyForecast; unit: "celsius" | "fahrenheit" }) {
  const hour = parseInt(h.time.split("T")[1]?.split(":")[0] ?? "0", 10);
  const label = hour === 0 ? "0" : `${hour}`;

  return (
    <View style={{ alignItems: "center", width: 64, gap: 6, paddingVertical: 4 }}>
      <ThemedText secondary style={{ fontSize: 13 }}>
        {label}
      </ThemedText>
      <WeatherIcon condition={h.condition} size={22} />
      <ThemedText style={{ fontSize: 17, fontWeight: "500" }}>
        {formatTemperature(h.temperature, unit)}
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
  const { settings } = useSettingsStore();
  const unit = settings.temperatureUnit;
  const data = hourly.slice(0, 25);

  const renderItem = useCallback(({ item }: { item: HourlyForecast }) => (
    <HourItem h={item} unit={unit} />
  ), [unit]);

  return (
    <ThemedCard style={{ marginBottom: 12, paddingHorizontal: 20, paddingVertical: 18 }}>
      <ThemedText
        secondary
        style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 14, letterSpacing: 0.5 }}
      >
        Previsión horaria
      </ThemedText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item, i) => `${item.time}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 8 }}
        getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
      />
    </ThemedCard>
  );
}
