import { View, TouchableOpacity, Animated, PanResponder, StyleSheet } from "react-native";
import { ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { MapPin, Trash2 } from "lucide-react-native";
import type { City } from "@/types/weather";
import { useRef, memo } from "react";

interface SwipeableCityRowProps {
  city: City;
  isActive: boolean;
  canDelete: boolean;
  onSelect: (city: City) => void;
  onDelete: (id: string) => void;
}

export const SwipeableCityRow = memo(function SwipeableCityRow({
  city,
  isActive,
  canDelete,
  onSelect,
  onDelete,
}: SwipeableCityRowProps) {
  const { isDark } = useThemeContext();
  const translateX = useRef(new Animated.Value(0)).current;
  const iconColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const separator = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => canDelete && Math.abs(gs.dx) > 20 && gs.dy < 20,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          translateX.setValue(Math.max(gs.dx, -80));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) {
          Animated.spring(translateX, { toValue: -80, useNativeDriver: true }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handlePress = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    onSelect(city);
  };

  return (
    <View style={{ borderTopWidth: 0.5, borderTopColor: separator }}>
      <View style={{ flexDirection: "row" }}>
        {canDelete && (
          <TouchableOpacity
            onPress={() => onDelete(city.id)}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 80,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FF3B30",
            }}
          >
            <Trash2 size={20} color="#FFF" />
          </TouchableOpacity>
        )}

        <Animated.View
          style={{ transform: [{ translateX }], flex: 1 }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={handlePress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 16,
              gap: 10,
              backgroundColor: isDark ? "#1C1C1E" : "#FFF",
            }}
          >
            {isActive && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#2196F3" }} />
            )}
            {city.isLocation && <MapPin size={14} color={iconColor} />}
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 17, fontWeight: isActive ? "600" : "400" }}>
                {city.name}
              </ThemedText>
              {city.admin1 && (
                <ThemedText secondary style={{ fontSize: 14 }}>
                  {city.admin1}{city.country ? `, ${city.country}` : ""}
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
});
