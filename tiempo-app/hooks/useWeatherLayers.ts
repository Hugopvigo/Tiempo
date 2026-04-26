import { useState, useEffect, useMemo } from "react";
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
  humidity: { layer: "HRD0", v2: true },
  pressure: { layer: "pressure_new" },
};

export function useWeatherLayers() {
  const [data, setData] = useState<RainViewerData | null>(null);
  const [radarUrl, setRadarUrl] = useState<string | null>(null);
  const [satelliteUrl, setSatelliteUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsStore();
  const owmApiKey = settings.openWeatherMapApiKey ?? "";

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

  const selectFrame = (idx: number) => {
    if (!data) return;
    setFrameIndex(idx);
    setRadarUrl(getRadarTileUrl(data, idx));
  };

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
  };
}
