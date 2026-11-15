import { View } from "react-native";
import { ThemedText } from "./ThemedText";

/**
 * Cabecera de tarjeta: título a la izquierda y, si se pasa, un dato resumen a
 * la derecha ("18 mm"). Un solo estilo para que todas las tarjetas alineen igual.
 */
export function CardTitle({
  children,
  aside,
  asideColor,
}: {
  children: string;
  aside?: string;
  asideColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <ThemedText style={{ fontSize: 15, fontWeight: "600", flexShrink: 1 }} numberOfLines={1}>
        {children}
      </ThemedText>
      {aside !== undefined && (
        <ThemedText
          secondary={!asideColor}
          style={[{ fontSize: 13, fontWeight: "600" }, asideColor ? { color: asideColor } : null]}
        >
          {aside}
        </ThemedText>
      )}
    </View>
  );
}
