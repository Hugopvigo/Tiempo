import { View, type ViewProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { cardBackground, cardBorder } from "@/constants/theme";

export function ThemedCard({ style, ...props }: ViewProps) {
  const { isDark } = useThemeContext();
  const bg = isDark ? cardBackground.dark : cardBackground.light;
  const borderColor = isDark ? cardBorder.dark : cardBorder.light;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: 28,
          padding: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: borderColor,
          // Sombra suave para profundidad
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
        style,
      ]}
      {...props}
    />
  );
}
