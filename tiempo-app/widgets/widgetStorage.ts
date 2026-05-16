import { createMMKV } from "react-native-mmkv";
import type { WeatherCondition } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });
const WIDGET_KEY = "widget-data";

export interface WidgetDailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  precipitationChance: number;
}

export interface WidgetWeatherData {
  cityName: string;
  temperature: number;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  description: string;
  unit: "celsius" | "fahrenheit";
  updatedAt: number;
  forecast: WidgetDailyForecast[];
}

export function saveWidgetData(data: WidgetWeatherData): void {
  storage.set(WIDGET_KEY, JSON.stringify(data));
}

export function loadWidgetData(): WidgetWeatherData | null {
  try {
    const json = storage.getString(WIDGET_KEY);
    if (!json) return null;
    return JSON.parse(json) as WidgetWeatherData;
  } catch {
    return null;
  }
}
