import { useMemo } from "react";
import { calculateMoonPhase, calculateMoonTimes } from "@/utils/lunar";
import type { DailyForecast, LunarPhaseData } from "@/types/weather";

export function useLunarPhase(
  lat: number,
  lon: number,
  daily?: DailyForecast[]
): LunarPhaseData | null {
  return useMemo(() => {
    const now = new Date();
    const { phaseIndex, phase, illumination } = calculateMoonPhase(now);
    const { moonrise, moonset } = calculateMoonTimes(now, lat, lon);

    const today = daily?.[0];
    const sunrise = today?.sunrise
      ? new Date(today.sunrise).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : "--:--";
    const sunset = today?.sunset
      ? new Date(today.sunset).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : "--:--";

    return {
      phaseIndex,
      phase,
      illumination,
      moonrise,
      moonset,
      sunrise,
      sunset,
    };
  }, [lat, lon, daily]);
}
