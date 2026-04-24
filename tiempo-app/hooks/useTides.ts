import { useQuery } from "@tanstack/react-query";
import { getMarineWeather } from "@/services/openmeteo";
import type { MarineData, SeaCondition } from "@/types/weather";
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
