import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { MapPin, Trash2 } from "lucide-react-native";
import type { City } from "@/types/weather";
import { useRef, memo, useCallback } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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
  const translateX = useSharedValue(0);
  const iconColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const separator = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const handleSelect = useCallback(() => {
    translateX.value = withSpring(0);
    onSelect(city);
  }, [city, onSelect, translateX]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .enabled(canDelete)
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -80);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -50) {
        translateX.value = withSpring(-80);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ borderTopWidth: 0.5, borderTopColor: separator, overflow: "hidden" }}>
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

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
              },
              animatedStyle,
            ]}
          >
            <TouchableOpacity
              onPress={handleSelect}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 10,
                backgroundColor: isDark ? "rgba(90,200,250,0.1)" : "rgba(0,122,255,0.05)",
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
        </GestureDetector>
      </View>
    </View>
  );
});
