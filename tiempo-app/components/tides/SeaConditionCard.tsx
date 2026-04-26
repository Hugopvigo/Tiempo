import { View } from "react-native";
import { ThemedCard, ThemedText, useThemeContext } from "@/components/theme";
import type { SeaCondition } from "@/types/weather";
import { windDirectionLabel } from "@/constants/weather";
import { Waves, Compass, Timer, AlertTriangle } from "lucide-react-native";

interface SeaConditionCardProps {
  condition: SeaCondition;
}

export function SeaConditionCard({ condition }: SeaConditionCardProps) {
  const { isDark } = useThemeContext();
  const iconColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  const accentColor = isDark ? "#5AC8FA" : "#007AFF";

  const isDangerous = condition.waveHeight >= 3;

  return (
    <ThemedCard>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Waves size={20} color={accentColor} />
        <ThemedText
          secondary
          style={{
            fontSize: 13,
            fontWeight: "600",
            textTransform: "uppercase",
            marginLeft: 8,
            letterSpacing: 0.5,
          }}
        >
          Estado del mar
        </ThemedText>
      </View>

      <ThemedText style={{ fontSize: 28, fontWeight: "600", marginBottom: 4 }}>
        {condition.label}
      </ThemedText>
      <ThemedText secondary style={{ fontSize: 14, marginBottom: 16 }}>
        {condition.description}
      </ThemedText>

      {isDangerous && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,59,48,0.12)",
            padding: 10,
            borderRadius: 10,
            marginBottom: 16,
            gap: 8,
          }}
        >
          <AlertTriangle size={16} color="#FF3B30" />
          <ThemedText style={{ fontSize: 13, color: "#FF3B30", fontWeight: "500" }}>
            Precaución: oleaje peligroso
          </ThemedText>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 0 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Waves size={18} color={iconColor} />
          <ThemedText style={{ fontSize: 18, fontWeight: "600", marginTop: 4 }}>
            {condition.waveHeight.toFixed(1)} m
          </ThemedText>
<ThemedText secondary style={{ fontSize: 13, marginTop: 2 }}>
        Altura
      </ThemedText>
    </View>
    <View style={{ flex: 1, alignItems: "center" }}>
      <Compass size={18} color={iconColor} />
      <ThemedText style={{ fontSize: 18, fontWeight: "600", marginTop: 4 }}>
        {windDirectionLabel(condition.waveDirection)}
      </ThemedText>
      <ThemedText secondary style={{ fontSize: 13, marginTop: 2 }}>
        Dirección
      </ThemedText>
    </View>
    <View style={{ flex: 1, alignItems: "center" }}>
      <Timer size={18} color={iconColor} />
      <ThemedText style={{ fontSize: 18, fontWeight: "600", marginTop: 4 }}>
        {condition.wavePeriod.toFixed(0)} s
      </ThemedText>
      <ThemedText secondary style={{ fontSize: 13, marginTop: 2 }}>
        Periodo
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );
}
