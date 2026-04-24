import { View, TouchableOpacity } from "react-native";
import { useThemeContext } from "@/components/theme";
import { Home, Search, Waves, Map, Settings } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";

const tabs = [
  { path: "/", icon: Home, label: "Inicio" },
  { path: "/search", icon: Search, label: "Buscar" },
  { path: "/tides", icon: Waves, label: "Mareas" },
  { path: "/map", icon: Map, label: "Mapa" },
  { path: "/settings", icon: Settings, label: "Ajustes" },
] as const;

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeContext();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 8,
        paddingBottom: 12,
        borderTopWidth: 0.5,
        borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const color = isActive
          ? "#2196F3"
          : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

        return (
          <TouchableOpacity
            key={tab.path}
            onPress={() => router.push(tab.path as any)}
            style={{ alignItems: "center", gap: 2, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <tab.icon size={22} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
