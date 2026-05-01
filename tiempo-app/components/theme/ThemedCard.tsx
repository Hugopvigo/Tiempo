import { View, StyleSheet, type ViewProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { cardBackground } from "@/constants/theme";

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});

export function ThemedCard({ style, ...props }: ViewProps) {
  const { isDark } = useThemeContext();
  const bg = isDark ? cardBackground.dark : cardBackground.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          shadowOpacity: isDark ? 0.2 : 0.04,
          elevation: isDark ? 3 : 1,
        },
        style,
      ]}
      {...props}
    />
  );
}
