import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/components/theme";
import { WeatherMap, LayerSelector, LayerInfo, RadarTimeline } from "@/components/map";
import type { MapLayer } from "@/components/map";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { useCities } from "@/hooks/useCities";
import { useWeatherLayers } from "@/hooks/useWeatherLayers";
import { useState, useCallback } from "react";
import { Locate } from "lucide-react-native";
import { screenBackground } from "@/constants/theme";

export default function MapScreen() {
  const { isDark } = useThemeContext();
  const { cities, activeCity, setActiveCity } = useCities();
  const insets = useSafeAreaInsets();
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>("precipitation");
  const {
    radarUrl,
    satelliteUrl,
    owmLayers,
    availableLayers,
    loading: _layersLoading,
    useOwmClouds,
    timestamps,
    frameIndex,
    selectFrame,
    isPlaying,
    togglePlay,
    stopPlay,
    radarFrameUrls,
    pastCount,
  } = useWeatherLayers();

  const isRadarLayer = selectedLayer === "precipitation";

  const handleCityPress = useCallback((city: typeof cities[0]) => {
    setActiveCity(city);
  }, [setActiveCity]);

  const handleFrameChange = useCallback((idx: number) => {
    selectFrame(idx);
  }, [selectFrame]);

  const handleSelectFrame = useCallback((idx: number) => {
    stopPlay();
    selectFrame(idx);
  }, [stopPlay, selectFrame]);

  const handleLayerChange = useCallback((layer: MapLayer) => {
    setSelectedLayer(layer);
    if (layer !== "precipitation") stopPlay();
  }, [stopPlay]);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? screenBackground.dark : screenBackground.light }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <WeatherMap
          cities={cities}
          activeCity={activeCity}
          onCityPress={handleCityPress}
          radarTileUrl={radarUrl}
          satelliteTileUrl={satelliteUrl}
          owmLayers={owmLayers}
          activeLayer={selectedLayer}
          useOwmClouds={useOwmClouds}
          radarFrameUrls={isRadarLayer ? radarFrameUrls : []}
          isPlaying={isRadarLayer && isPlaying}
          frameIndex={frameIndex}
          pastCount={pastCount}
          onFrameChange={handleFrameChange}
        />
      </View>

      <LayerInfo layer={selectedLayer} />

      {isRadarLayer && (
        <RadarTimeline
          timestamps={timestamps}
          frameIndex={frameIndex}
          pastCount={pastCount}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onSelectFrame={handleSelectFrame}
        />
      )}

      <LayerSelector
        selected={selectedLayer}
        onSelect={handleLayerChange}
        availableLayers={availableLayers as MapLayer[]}
        showRadarTimeline={isRadarLayer && timestamps.length > 0}
      />

      <TouchableOpacity
        onPress={() => setActiveCity(cities[0])}
        style={{
          position: "absolute",
          top: insets.top + 12,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
        }}
      >
        <Locate
          size={20}
          color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"}
        />
      </TouchableOpacity>

      <BottomNavBar />
    </View>
  );
}
