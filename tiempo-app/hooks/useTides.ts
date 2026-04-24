import { useQuery } from "@tanstack/react-query";
import { getMarineWeather } from "@/services/openmeteo";

export function useTides(lat: number, lon: number, isCoastal: boolean) {
  return useQuery({
    queryKey: ["tides", lat, lon],
    queryFn: () => getMarineWeather(lat, lon),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isCoastal && lat !== 0 && lon !== 0,
  });
}
