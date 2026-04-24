import { useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";
import type { City } from "@/types/weather";

interface LocationState {
  city: City | null;
  error: string | null;
  loading: boolean;
  requestAndSet: () => Promise<void>;
}

export function useLocation(): LocationState {
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestAndSet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permiso de ubicación denegado");
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });

      const lat = Math.round(pos.coords.latitude * 10000) / 10000;
      const lon = Math.round(pos.coords.longitude * 10000) / 10000;

      const locationCity: City = {
        id: "gps-current",
        name: "Mi ubicación",
        country: "",
        admin1: "",
        lat,
        lon,
        isLocation: true,
      };

      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (reverse.length > 0) {
          const r = reverse[0];
          locationCity.name = r.city || r.subregion || "Mi ubicación";
          locationCity.country = r.country || "";
          locationCity.admin1 = r.region || "";
        }
      } catch {}

      setCity(locationCity);
    } catch {
      setError("No se pudo obtener la ubicación");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestAndSet();
  }, [requestAndSet]);

  return { city, error, loading, requestAndSet };
}
