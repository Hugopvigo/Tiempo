import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext, ThemedText } from "@/components/theme";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { Map as MapIcon } from "lucide-react-native";

export default function MapScreen() {
  const { isDark } = useThemeContext();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <MapIcon size={48} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
        <ThemedText style={{ fontSize: 34, fontWeight: "600", marginTop: 12 }}>
          Mapa
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 16, textAlign: "center", marginTop: 8 }}>
          Mapa meteorológico con capas de radar, nubes y temperatura.
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 14, marginTop: 4 }}>
          Disponible en la Fase 5
        </ThemedText>
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}
