import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { isAEMETConfigured, getAEMETAlerts } from "@/services/aemet";
import { generateAlerts } from "@/services/alerts";
import { getAEMETZone } from "@/constants/aemetZones";
import type { WeatherAlert, WeatherData, City } from "@/types/weather";

export function useAEMETAlerts(zonaCode: string | undefined) {
  return useQuery<WeatherAlert[]>({
    queryKey: ["alerts", zonaCode],
    queryFn: () => getAEMETAlerts(zonaCode!),
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

export function useMergedAlerts(
  weather: WeatherData | undefined,
  city: City | undefined
): WeatherAlert[] {
  const zonaCode = city ? getAEMETZone(city) : undefined;
  const aemetConfigured = isAEMETConfigured() && !!zonaCode;

  const { data: aemetAlerts, isLoading: aemetLoading } = useAEMETAlerts(
    aemetConfigured ? zonaCode : undefined
  );

  const localAlerts = useLocalAlerts(weather);

  return useMemo(() => {
    if (!aemetConfigured || aemetLoading) return localAlerts;

    if (!aemetAlerts || aemetAlerts.length === 0) return localAlerts;

    const aemetTypes = new Set(aemetAlerts.map((a) => a.type));
    const complementLocal = localAlerts.filter(
      (a) => !aemetTypes.has(a.type)
    );
    const merged = [...aemetAlerts, ...complementLocal];
    merged.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
    return merged;
  }, [aemetAlerts, aemetLoading, aemetConfigured, localAlerts]);
}

function severityOrder(s: WeatherAlert["severity"]): number {
  return s === "red" ? 0 : s === "orange" ? 1 : 2;
}
