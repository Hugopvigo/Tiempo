import { View } from "react-native";
import { ThemedText } from "@/components/theme";
import { WeatherIcon } from "./WeatherIcon";
import type { WeatherCondition } from "@/types/weather";

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
  return (
    <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 24 }}>
      <ThemedText style={{ fontSize: 34, fontWeight: "600", letterSpacing: 0.5 }}>
        {cityName}
      </ThemedText>

      <WeatherIcon condition={condition} size={40} colored />

      <ThemedText style={{ fontSize: 102, fontWeight: "200", marginTop: -4 }}>
        {Math.round(temperature)}°
      </ThemedText>

      <ThemedText secondary style={{ fontSize: 18, marginTop: -8 }}>
        {description}
      </ThemedText>

      <ThemedText secondary style={{ fontSize: 18, marginTop: 2 }}>
        H:{Math.round(tempMax)}°  L:{Math.round(tempMin)}°
      </ThemedText>
    </View>
  );
}
