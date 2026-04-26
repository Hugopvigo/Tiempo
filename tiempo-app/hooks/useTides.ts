import { useQuery } from "@tanstack/react-query";
import { getMarineWeather } from "@/services/openmeteo";
import type { MarineData, SeaCondition, TideDirectionInfo, TideForecast, TideData } from "@/types/weather";
import { getSeaConditionLabel, getSeaConditionDescription } from "@/types/weather";

export function useTides(lat: number, lon: number, isCoastal: boolean) {
  return useQuery<MarineData>({
    queryKey: ["tides", lat, lon],
    queryFn: () => getMarineWeather(lat, lon),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isCoastal && lat !== 0 && lon !== 0,
    retry: 1,
  });
}

export function useCurrentSeaCondition(lat: number, lon: number, isCoastal: boolean): SeaCondition | null {
  const { data } = useTides(lat, lon, isCoastal);
  if (!data) return null;

  const now = new Date();
  const currentIdx = data.hourly.time.findIndex((t) => new Date(t) >= now);
  const idx = currentIdx >= 0 ? currentIdx : 0;

  const waveHeight = data.hourly.waveHeight[idx] ?? 0;
  return {
    waveHeight,
    waveDirection: data.hourly.waveDirection[idx] ?? 0,
    wavePeriod: data.hourly.wavePeriod[idx] ?? 0,
    label: getSeaConditionLabel(waveHeight),
    description: getSeaConditionDescription(waveHeight),
  };
}

export function useTideDirection(lat: number, lon: number, isCoastal: boolean): TideDirectionInfo | null {
  const { data } = useTides(lat, lon, isCoastal);
  if (!data) return null;

  const levels = data.hourly.seaLevelHeight;
  const times = data.hourly.time;
  if (!levels || levels.length === 0) return null;

  const now = new Date();
  const currentIdx = times.findIndex((t) => new Date(t) >= now);
  const idx = currentIdx >= 0 ? currentIdx : 0;

  const currentHeight = levels[idx];
  if (currentHeight == null) return null;

  const lookback = 3;
  const prevIdx = Math.max(0, idx - lookback);
  const prevHeight = levels[prevIdx] ?? currentHeight;

  const diff = currentHeight - prevHeight;
  let direction: TideDirectionInfo["direction"] = "stable";
  if (diff > 0.02) direction = "rising";
  else if (diff < -0.02) direction = "falling";

  return { height: currentHeight, direction };
}

export function deriveTideForecasts(
  seaLevelHeight: number[],
  times: string[],
  dates: string[]
): TideForecast[] {
  if (!seaLevelHeight || seaLevelHeight.length === 0) return [];

  const forecasts: TideForecast[] = [];

  for (const dateStr of dates) {
    const dayStart = new Date(`${dateStr}T00:00`).getTime();
    const dayEnd = new Date(`${dateStr}T23:59`).getTime();

    const dayIndices: number[] = [];
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]).getTime();
      if (t >= dayStart && t <= dayEnd) dayIndices.push(i);
    }

    if (dayIndices.length < 3) continue;

    const dayLevels = dayIndices.map((i) => seaLevelHeight[i]);
    const dayTimes = dayIndices.map((i) => times[i]);

    const tides: TideData[] = [];

    for (let i = 1; i < dayLevels.length - 1; i++) {
      const prev = dayLevels[i - 1];
      const curr = dayLevels[i];
      const next = dayLevels[i + 1];

      if (prev == null || curr == null || next == null) continue;

      if (curr > prev && curr > next) {
        tides.push({ time: dayTimes[i], height: curr, type: "high" });
      } else if (curr < prev && curr < next) {
        tides.push({ time: dayTimes[i], height: curr, type: "low" });
      }
    }

    const meanLevel = dayLevels.filter((h) => h != null).reduce((a, b) => a + b, 0) / dayLevels.filter((h) => h != null).length;
    const range = Math.max(...dayLevels.filter((h) => h != null)) - Math.min(...dayLevels.filter((h) => h != null));
    const coefficient = range > 0 ? Math.round((range / meanLevel) * 100) : undefined;

    forecasts.push({
      date: dateStr,
      tides,
      coefficient,
    });
  }

  return forecasts;
}
