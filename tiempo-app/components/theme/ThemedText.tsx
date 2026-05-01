import { Text, StyleSheet, type TextProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { textColor, secondaryTextColor } from "@/constants/theme";

interface ThemedTextProps extends TextProps {
  secondary?: boolean;
}

const styles = StyleSheet.create({
  text: {},
});

export function ThemedText({ secondary, style, ...props }: ThemedTextProps) {
  const { isDark } = useThemeContext();
  const color = secondary
    ? isDark ? secondaryTextColor.dark : secondaryTextColor.light
    : isDark ? textColor.dark : textColor.light;

  return <Text style={[styles.text, { color }, style]} {...props} />;
}
