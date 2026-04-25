import { useState, useEffect } from "react";
import {
  getRainViewerData,
  getRadarTileUrl,
  getSatelliteTileUrl,
  getRadarTimestamps,
  type RainViewerData,
} from "@/services/weatherLayers";

export function useWeatherLayers() {
  const [data, setData] = useState<RainViewerData | null>(null);
  const [radarUrl, setRadarUrl] = useState<string | null>(null);
  const [satelliteUrl, setSatelliteUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [frameIndex, setFrameIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

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

  return {
    radarUrl,
    satelliteUrl,
    timestamps,
    frameIndex,
    selectFrame,
    loading,
    hasRadar: (data?.radarPast.length ?? 0) > 0,
    hasSatellite: (data?.satelliteInfrared.length ?? 0) > 0,
  };
}
