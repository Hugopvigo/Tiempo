import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText, useThemeContext } from "@/components/theme";
import { CloudRain, Cloud, Thermometer, Wind, Eye, Waves } from "lucide-react-native";

export type MapLayer = "precipitation" | "clouds" | "temperature" | "wind" | "visibility" | "waves";

interface LayerSelectorProps {
  selected: MapLayer;
  onSelect: (layer: MapLayer) => void;
  availableLayers?: MapLayer[];
}

const layers: { id: MapLayer; label: string; icon: any; desc: string }[] = [
  { id: "precipitation", label: "Lluvia", icon: CloudRain, desc: "Radar de precipitación" },
  { id: "clouds", label: "Nubes", icon: Cloud, desc: "Satélite infrarrojo" },
  { id: "temperature", label: "Temp", icon: Thermometer, desc: "Temperatura superficial" },
  { id: "wind", label: "Viento", icon: Wind, desc: "Velocidad del viento" },
  { id: "visibility", label: "Vis", icon: Eye, desc: "Visibilidad" },
  { id: "waves", label: "Oleaje", icon: Waves, desc: "Altura de olas" },
];

export function LayerSelector({ selected, onSelect, availableLayers }: LayerSelectorProps) {
  const { isDark } = useThemeContext();
  const activeColor = isDark ? "#5AC8FA" : "#007AFF";
  const available = new Set(availableLayers ?? ["precipitation", "clouds"]);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {layers.map((layer) => {
          const isActive = selected === layer.id;
          const isAvailable = available.has(layer.id);
          const Icon = layer.icon;
          return (
            <TouchableOpacity
              key={layer.id}
              onPress={() => isAvailable && onSelect(layer.id)}
              activeOpacity={isAvailable ? undefined : 0.4}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: isActive
                  ? isDark
                    ? "rgba(90,200,250,0.2)"
                    : "rgba(0,122,255,0.15)"
                  : isDark
                    ? "rgba(0,0,0,0.6)"
                    : "rgba(255,255,255,0.85)",
                borderWidth: 1,
                borderColor: isActive
                  ? activeColor
                  : isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
                opacity: isAvailable ? 1 : 0.4,
              }}
            >
              <Icon
                size={16}
                color={isActive ? activeColor : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
              />
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? activeColor : undefined,
                }}
                secondary={!isActive}
              >
                {layer.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function LayerInfo({ layer }: { layer: MapLayer }) {
  const { isDark } = useThemeContext();
  const info = layers.find((l) => l.id === layer);
  if (!info) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 60,
        left: 16,
        backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
      }}
    >
      <ThemedText style={{ fontSize: 12, fontWeight: "500" }}>
        {info.desc}
      </ThemedText>
    </View>
  );
}
