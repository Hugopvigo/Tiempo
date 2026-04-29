import { useQuery } from "@tanstack/react-query";
import { getAirQuality } from "@/services/openmeteo";
import type { AirQualityData } from "@/types/weather";

export function useAirQuality(lat: number, lon: number) {
  return useQuery<AirQualityData>({
    queryKey: ["airQuality", lat, lon],
    queryFn: () => getAirQuality(lat, lon),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: lat !== 0 && lon !== 0,
    retry: 1,
  });
}
