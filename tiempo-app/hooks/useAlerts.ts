import { useQuery } from "@tanstack/react-query";
import { isAEMETConfigured, getAEMETAlerts } from "@/services/aemet";

export function useAlerts(zonaCode: string) {
  return useQuery({
    queryKey: ["alerts", zonaCode],
    queryFn: () => getAEMETAlerts(zonaCode),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isAEMETConfigured() && !!zonaCode,
  });
}
