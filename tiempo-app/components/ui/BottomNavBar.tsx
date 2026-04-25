import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const color = isActive
            ? "#007AFF"
            : isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.35)";

          return (
            <TouchableOpacity
              key={tab.path}
              onPress={() => router.push(tab.path as any)}
              hitSlop={{ top: 4, bottom: 4, left: 12, right: 12 }}
              style={{ alignItems: "center", gap: 2, paddingHorizontal: 16, paddingVertical: 2 }}
            >
              <tab.icon size={22} color={color} />
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isActive ? "#007AFF" : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
