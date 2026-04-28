import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  getRainViewerData,
  getRadarTileUrl,
  getSatelliteTileUrl,
  getRadarTimestamps,
  getOpenWeatherMapTileUrl,
  getOpenWeatherMapV2TileUrl,
  type RainViewerData,
} from "@/services/weatherLayers";
import { useSettingsStore } from "@/stores/cityStore";

const OWM_LAYER_MAP: Record<string, { layer: string; v2?: boolean }> = {
  temperature: { layer: "temp_new" },
  wind: { layer: "wind_new" },
  clouds: { layer: "clouds_new" },
  humidity: { layer: "HRD0", v2: true },
  pressure: { layer: "pressure_new" },
};

export function useWeatherLayers() {
  const [data, setData] = useState<RainViewerData | null>(null);
  const [radarUrl, setRadarUrl] = useState<string | null>(null);
  const [satelliteUrl, setSatelliteUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsStore();
  const owmApiKey = settings.openWeatherMapApiKey ?? "";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getRainViewerData().then((d) => {
      if (!d) {
        setLoading(false);
        return;
      }
      setData(d);
      const lastIdx = d.radarPast.length + d.radarNowcast.length - 1;
      setFrameIndex(lastIdx);
      setRadarUrl(getRadarTileUrl(d, lastIdx));
      setSatelliteUrl(getSatelliteTileUrl(d));
      setTimestamps(getRadarTimestamps(d));
      setLoading(false);
    });
  }, []);

  const selectFrame = useCallback((idx: number) => {
    if (!data) return;
    const clamped = Math.max(0, Math.min(idx, timestamps.length - 1));
    setFrameIndex(clamped);
    setRadarUrl(getRadarTileUrl(data, clamped));
  }, [data, timestamps.length]);

  const radarFrameUrls = useMemo(() => {
    if (!data) return [];
    const count = data.radarPast.length + data.radarNowcast.length;
    return Array.from({ length: count }, (_, i) => getRadarTileUrl(data, i));
  }, [data]);

  const pastCount = data?.radarPast.length ?? 0;

  useEffect(() => {
    if (isPlaying && timestamps.length > 1) {
      intervalRef.current = setInterval(() => {
        setFrameIndex((prev) => {
          const next = (prev + 1) % timestamps.length;
          if (data) setRadarUrl(getRadarTileUrl(data, next));
          return next;
        });
      }, 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, timestamps.length, data]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const owmLayers = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const [layer, config] of Object.entries(OWM_LAYER_MAP)) {
      result[layer] = config.v2
        ? getOpenWeatherMapV2TileUrl(config.layer, owmApiKey)
        : getOpenWeatherMapTileUrl(config.layer, owmApiKey);
    }
    return result;
  }, [owmApiKey]);

  const availableLayers = useMemo(() => {
    const layers: string[] = ["precipitation", "clouds"];
    if (owmApiKey) {
      layers.push("temperature", "wind", "humidity", "pressure");
    }
    return layers;
  }, [owmApiKey]);

  const useOwmClouds = !!owmApiKey;

  return {
    radarUrl,
    satelliteUrl,
    owmLayers,
    availableLayers,
    timestamps,
    frameIndex,
    selectFrame,
    loading,
    hasRadar: (data?.radarPast.length ?? 0) > 0,
    hasSatellite: true,
    useOwmClouds,
    isPlaying,
    togglePlay,
    stopPlay,
    radarFrameUrls,
    pastCount,
  };
}
