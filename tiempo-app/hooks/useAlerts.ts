import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { isAEMETConfigured, getAEMETAlerts } from "@/services/aemet";
import { generateAlerts } from "@/services/alerts";
import type { WeatherAlert, WeatherData } from "@/types/weather";

export function useAlerts(zonaCode: string) {
  return useQuery<WeatherAlert[]>({
    queryKey: ["alerts", zonaCode],
    queryFn: () => getAEMETAlerts(zonaCode),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isAEMETConfigured() && !!zonaCode,
  });
}

export function useLocalAlerts(weather: WeatherData | undefined): WeatherAlert[] {
  return useMemo(() => {
    if (!weather) return [];
    return generateAlerts(weather);
  }, [weather]);
}
