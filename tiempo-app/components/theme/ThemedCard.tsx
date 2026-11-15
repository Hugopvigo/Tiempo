import { View, StyleSheet, type ViewProps } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { cardBackground } from "@/constants/theme";

// Tarjeta plana: sin sombra ni elevación (con fondo translúcido la elevación
// de Android dibuja un borde sucio) y con el mismo radio y relleno en toda la app.
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
});

export function ThemedCard({ style, ...props }: ViewProps) {
  const { isDark } = useThemeContext();
  const bg = isDark ? cardBackground.dark : cardBackground.light;

  return <View style={[styles.card, { backgroundColor: bg }, style]} {...props} />;
}
