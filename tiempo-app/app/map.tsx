import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext, ThemedText } from "@/components/theme";
import { WeatherMap, LayerSelector, LayerInfo } from "@/components/map";
import type { MapLayer } from "@/components/map";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { useCities } from "@/hooks/useCities";
import { useState, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Locate } from "lucide-react-native";

export default function MapScreen() {
  const { isDark } = useThemeContext();
  const { cities, activeCity, setActiveCity } = useCities();
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>("precipitation");

  const handleCityPress = useCallback((city: typeof cities[0]) => {
    setActiveCity(city);
  }, [setActiveCity]);

  return (
    <View style={{ flex: 1 }}>
      <WeatherMap
        cities={cities}
        activeCity={activeCity}
        onCityPress={handleCityPress}
      />

      <LayerInfo layer={selectedLayer} />
      <LayerSelector selected={selectedLayer} onSelect={setSelectedLayer} />

      <View
        style={{
          position: "absolute",
          top: 56,
          right: 16,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveCity(cities[0])}
          style={{
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
      </View>

      <BottomNavBar />
    </View>
  );
}
