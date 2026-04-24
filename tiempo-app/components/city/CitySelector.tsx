import { View, TouchableOpacity, Modal, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { useCities } from "@/hooks/useCities";
import { MapPin, Check, Plus, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { City } from "@/types/weather";
import { memo, useState } from "react";

const CityItem = memo(function CityItem({
  city,
  isActive,
  isDark,
  onSelect,
}: {
  city: City;
  isActive: boolean;
  isDark: boolean;
  onSelect: (c: City) => void;
}) {
  const iconColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const separator = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <TouchableOpacity
      onPress={() => onSelect(city)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: separator,
        gap: 10,
      }}
    >
      {city.isLocation && <MapPin size={14} color={iconColor} />}
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: isActive ? "600" : "400" }}>
          {city.name}
        </ThemedText>
        {city.admin1 && (
          <ThemedText secondary style={{ fontSize: 14 }}>
            {city.admin1}{city.country ? `, ${city.country}` : ""}
          </ThemedText>
        )}
      </View>
      {isActive && <Check size={18} color="#2196F3" />}
    </TouchableOpacity>
  );
});

interface CitySelectorProps {
  visible: boolean;
  onClose: () => void;
}

export function CitySelector({ visible, onClose }: CitySelectorProps) {
  const { isDark } = useThemeContext();
  const { cities, activeCity, setActiveCity } = useCities();
  const router = useRouter();

  const handleSelect = (city: City) => {
    setActiveCity(city);
    onClose();
  };

  const handleAddCity = () => {
    onClose();
    router.push("/search");
  };

  const bgColor = isDark ? "#1C1C1E" : "#F2F2F7";
  const cardBg = isDark ? "#2C2C2E" : "#FFFFFF";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: bgColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "70%",
            paddingBottom: 20,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
              Ciudades
            </ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={22} color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 400 }}>
            {cities.map((city) => (
              <CityItem
                key={city.id}
                city={city}
                isActive={city.id === activeCity.id}
                isDark={isDark}
                onSelect={handleSelect}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleAddCity}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 14,
              marginHorizontal: 20,
              marginTop: 8,
              borderRadius: 12,
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            }}
          >
            <Plus size={18} color="#2196F3" />
            <ThemedText style={{ fontSize: 16, fontWeight: "500", color: "#2196F3" }}>
              Añadir ciudad
            </ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
