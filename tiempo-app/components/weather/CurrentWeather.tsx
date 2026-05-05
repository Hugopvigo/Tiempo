import { View } from "react-native";
import { ThemedText } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { WeatherCondition } from "@/types/weather";
import { formatTemperature } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";

interface CurrentWeatherProps {
  cityName: string;
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  description: string;
  tempMax: number;
  tempMin: number;
}

export function CurrentWeather({
  cityName,
  temperature,
  feelsLike,
  condition,
  description,
  tempMax,
  tempMin,
}: CurrentWeatherProps) {
  const { settings } = useSettingsStore();
  const unit = settings.temperatureUnit;

  return (
    <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 24 }}>
      {cityName ? (
        <ThemedText style={{ fontSize: 34, fontWeight: "600", letterSpacing: 0.5 }}>
          {cityName}
        </ThemedText>
      ) : null}

      <WeatherIcon condition={condition} size={40} colored />

      <ThemedText style={{ fontSize: 102, fontWeight: "200", marginTop: -4 }}>
        {formatTemperature(temperature, unit)}
      </ThemedText>

      <ThemedText secondary style={{ fontSize: 18, marginTop: -8 }}>
        {description}
      </ThemedText>

      <ThemedText secondary style={{ fontSize: 18, marginTop: 2 }}>
        H:{formatTemperature(tempMax, unit)} L:{formatTemperature(tempMin, unit)}
      </ThemedText>
    </View>
  );
}
