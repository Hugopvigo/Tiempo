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
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.2 : 0.04,
          shadowRadius: 8,
          elevation: isDark ? 3 : 1,
        },
        style,
      ]}
      {...props}
    />
  );
}
