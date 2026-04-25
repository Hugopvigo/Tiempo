import { useState, useEffect, useMemo } from "react";
import {
  getRainViewerData,
  getRadarTileUrl,
  getSatelliteTileUrl,
  getRadarTimestamps,
  getOpenWeatherMapTileUrl,
  type RainViewerData,
} from "@/services/weatherLayers";
import { useSettingsStore } from "@/stores/cityStore";

const OWM_LAYER_MAP: Record<string, string> = {
  temperature: "temp_new",
  wind: "wind_new",
  visibility: "clouds_new",
  waves: "precipitation_new",
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
    for (const [layer, owmId] of Object.entries(OWM_LAYER_MAP)) {
      result[layer] = getOpenWeatherMapTileUrl(owmId, owmApiKey);
    }
    return result;
  }, [owmApiKey]);

  const availableLayers = useMemo(() => {
    const layers: string[] = ["precipitation", "clouds"];
    if (owmApiKey) {
      layers.push("temperature", "wind", "visibility", "waves");
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
