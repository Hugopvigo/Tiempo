import { useEffect, useRef } from "react";
import type { WeatherData } from "@/types/weather";
import { useSettingsStore } from "@/stores/cityStore";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function formatTemp(temp: number, unit: "celsius" | "fahrenheit"): string {
  if (unit === "fahrenheit") return `${Math.round(temp * 9 / 5 + 32)}°F`;
  return `${Math.round(temp)}°`;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()];
}

let updateWidgetNative: ((json: string) => Promise<void>) | null = null;

try {
  const { requireNativeModule } = require("expo-modules-core");
  const mod = requireNativeModule("TiempoWidgetModule");
  if (mod) {
    updateWidgetNative = (json: string) => mod.updateWidgetData(json);
  }
} catch {}

async function updateWidgetData(data: {
  cityName: string;
  temp: string;
  condition: string;
  highLow: string;
  forecast: { name: string; temp: string }[];
}): Promise<void> {
  if (!updateWidgetNative) return;
  return await updateWidgetNative(JSON.stringify(data));
}

export function useWidgetUpdater(
  cityName: string,
  weather: WeatherData | undefined
) {
  const { settings } = useSettingsStore();
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (!weather) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 5 * 60 * 1000) return;
    lastUpdateRef.current = now;

    const unit = settings.temperatureUnit;
    const forecast = weather.daily.slice(0, 4).map((d) => ({
      name: getDayName(d.date),
      temp: `${Math.round(d.tempMax)}°/${Math.round(d.tempMin)}°`,
    }));

    updateWidgetData({
      cityName: cityName,
      temp: formatTemp(weather.current.temperature, unit),
      condition: weather.current.description,
      highLow: `${Math.round(weather.daily[0]?.tempMax ?? 0)}°/${Math.round(weather.daily[0]?.tempMin ?? 0)}°`,
      forecast,
    }).catch(() => {});
  }, [weather, cityName, settings.temperatureUnit]);
}
