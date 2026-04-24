import { Text, type TextProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { textColor, secondaryTextColor } from "@/constants/theme";

interface ThemedTextProps extends TextProps {
  secondary?: boolean;
}

export function ThemedText({ secondary, style, ...props }: ThemedTextProps) {
  const { isDark } = useThemeContext();
  const color = secondary
    ? isDark ? secondaryTextColor.dark : secondaryTextColor.light
    : isDark ? textColor.dark : textColor.light;

  return <Text style={[{ color, fontFamily: "System" }, style]} {...props} />;
}
