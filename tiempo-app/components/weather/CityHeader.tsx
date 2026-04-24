import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/theme";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin } from "lucide-react-native";
import { useThemeContext } from "@/components/theme";

interface CityHeaderProps {
  cityName: string;
  country?: string;
  isLocation?: boolean;
}

export function CityHeader({ cityName, country, isLocation }: CityHeaderProps) {
  const router = useRouter();
  const { isDark } = useThemeContext();
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <TouchableOpacity
      onPress={() => router.push("/search")}
      activeOpacity={0.6}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 8, paddingBottom: 4, gap: 4 }}
    >
      {isLocation && <MapPin size={14} color={iconColor} />}
      <ThemedText secondary style={{ fontSize: 16 }}>
        {cityName}{country ? `, ${country}` : ""}
      </ThemedText>
      <ChevronRight size={16} color={iconColor} />
    </TouchableOpacity>
  );
}
