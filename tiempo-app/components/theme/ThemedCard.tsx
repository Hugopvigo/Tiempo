import { View, type ViewProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { cardBackground } from "@/constants/theme";

export function ThemedCard({ style, ...props }: ViewProps) {
  const { isDark } = useThemeContext();
  const bg = isDark ? cardBackground.dark : cardBackground.light;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: 16,
          padding: 16,
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    />
  );
}
