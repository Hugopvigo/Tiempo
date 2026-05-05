import { View, TouchableOpacity, Modal, ScrollView, Pressable } from "react-native";
import { ThemedText , useThemeContext } from "@/components/theme";
import { useCities } from "@/hooks/useCities";
import { MapPin, Check, Plus, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { City } from "@/types/weather";
import { memo } from "react";

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
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            maxHeight: "70%",
            paddingBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 20,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
              Ciudades
            </ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={24} color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"} />
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
              gap: 8,
              paddingVertical: 16,
              marginHorizontal: 24,
              marginTop: 12,
              borderRadius: 100, // Forma de píldora
              backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.05)",
              borderWidth: 0.5,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Plus size={20} color="#2196F3" />
            <ThemedText style={{ fontSize: 16, fontWeight: "600", color: "#2196F3" }}>
              Añadir ciudad
            </ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
