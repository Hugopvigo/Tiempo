import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext, ThemedText } from "@/components/theme";
import { Home, Search, Waves, Map, Settings } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import { navBarBackground, textColor, secondaryTextColor } from "@/constants/theme";

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
              ? (isDark ? textColor.dark : textColor.light)
              : (isDark ? secondaryTextColor.dark : secondaryTextColor.light);

            return (
              <TouchableOpacity
                key={tab.path}
                onPress={() => {
                  if (pathname !== tab.path) {
                    router.replace(tab.path as any);
                  }
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
                activeOpacity={0.6}
                style={styles.tabItem}
              >
                <tab.icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
                <ThemedText style={{ fontSize: 11, color, fontWeight: isActive ? "600" : "400" }}>
                  {tab.label}
                </ThemedText>
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
    paddingTop: 6,
  },
  tabsWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 52,
  },
  // Cada pestaña ocupa su quinto entero: toda el área es pulsable.
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});
