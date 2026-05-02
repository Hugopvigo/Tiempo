import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/components/theme";
import { Home, Search, Waves, Map, Settings } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import { navBarBackground } from "@/constants/theme";

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
  const bg = isDark ? navBarBackground.dark : navBarBackground.light;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <View style={styles.tabsWrapper}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            const color = isActive
              ? "#007AFF"
              : isDark
                ? "rgba(255,255,255,0.4)"
                : "#718096";

            return (
              <TouchableOpacity
                key={tab.path}
                onPress={() => {
                  if (pathname !== tab.path) {
                    router.replace(tab.path as any);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.tabItem}
              >
                <tab.icon size={24} color={color} strokeWidth={isActive ? 2.5 : 2} />
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: isActive ? "#007AFF" : "transparent" },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 8,
  },
  content: {
    borderTopWidth: 0.5,
    paddingTop: 12,
  },
  tabsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 50,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
