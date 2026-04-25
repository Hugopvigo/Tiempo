import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/components/theme";
import { WeatherMap, LayerSelector, LayerInfo } from "@/components/map";
import type { MapLayer } from "@/components/map";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { useCities } from "@/hooks/useCities";
import { useState, useCallback } from "react";
import { Locate } from "lucide-react-native";

export default function MapScreen() {
  const { isDark } = useThemeContext();
  const { cities, activeCity, setActiveCity } = useCities();
  const insets = useSafeAreaInsets();
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>("precipitation");

  const handleCityPress = useCallback((city: typeof cities[0]) => {
    setActiveCity(city);
  }, [setActiveCity]);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <WeatherMap
          cities={cities}
          activeCity={activeCity}
          onCityPress={handleCityPress}
        />
      </View>

      <LayerInfo layer={selectedLayer} />
      <LayerSelector selected={selectedLayer} onSelect={setSelectedLayer} />

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
