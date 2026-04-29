import { View } from "react-native";
import { ThemedCard, ThemedText } from "@/components/theme";
import { useThemeContext } from "@/components/theme";
import { useSettingsStore } from "@/stores/cityStore";
import { Moon, Sunrise, Sunset } from "lucide-react-native";
import { Svg, Circle, Path, Defs, ClipPath, G } from "react-native-svg";
import type { LunarPhaseData } from "@/types/weather";

interface LunarPhaseCardProps {
  data: LunarPhaseData;
}

function MoonSVG({ phaseIndex, size, isDark, isColored }: { phaseIndex: number; size: number; isDark: boolean; isColored: boolean }) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  const darkFill = isColored ? "#1C1C2E" : (isDark ? "#2C2C2E" : "#D1D1D6");
  const lightFill = isColored ? "#FCD34D" : (isDark ? "#E5E5EA" : "#8E8E93");

  const renderPhase = () => {
    switch (phaseIndex) {
      case 0:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Circle cx={cx} cy={cy} r={r} fill="none" stroke={lightFill} strokeWidth={0.8} opacity={0.3} />
          </G>
        );
      case 1:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r * 0.5} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx} ${cy - r}`}
              fill={lightFill}
            />
          </G>
        );
      case 2:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} L ${cx} ${cy - r} Z`}
              fill={lightFill}
            />
          </G>
        );
      case 3:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={lightFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r * 0.35} ${r} 0 0 0 ${cx} ${cy + r} A ${r} ${r} 0 0 0 ${cx} ${cy - r}`}
              fill={darkFill}
            />
          </G>
        );
      case 4:
        return <Circle cx={cx} cy={cy} r={r} fill={lightFill} />;
      case 5:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={lightFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r * 0.35} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
              fill={darkFill}
            />
          </G>
        );
      case 6:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} L ${cx} ${cy - r} Z`}
              fill={lightFill}
            />
          </G>
        );
      case 7:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill={darkFill} />
            <Path
              d={`M ${cx} ${cy - r} A ${r * 0.5} ${r} 0 0 0 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
              fill={lightFill}
            />
          </G>
        );
      default:
        return <Circle cx={cx} cy={cy} r={r} fill={darkFill} />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderPhase()}
    </Svg>
  );
}

export function LunarPhaseCard({ data }: LunarPhaseCardProps) {
  const { isDark } = useThemeContext();
  const { settings } = useSettingsStore();
  const isColored = settings.iconStyle === "colored";
  const monoColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <ThemedCard style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Moon size={16} color={isColored ? "#FCD34D" : monoColor} />
        <ThemedText secondary style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Fase Lunar
        </ThemedText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <MoonSVG phaseIndex={data.phaseIndex} size={64} isDark={isDark} isColored={isColored} />

        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
            {data.phase}
          </ThemedText>
          <ThemedText secondary style={{ fontSize: 14 }}>
            Iluminación {data.illumination}%
          </ThemedText>
        </View>
      </View>

      <View style={{
        flexDirection: "row",
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        gap: 16,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
          <Sunrise size={14} color={isColored ? "#FFB800" : monoColor} />
          <View>
            <ThemedText secondary style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>Amanecer</ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>{data.sunrise}</ThemedText>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
          <Sunset size={14} color={isColored ? "#FF9500" : monoColor} />
          <View>
            <ThemedText secondary style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>Atardecer</ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>{data.sunset}</ThemedText>
          </View>
        </View>
      </View>

      {(data.moonrise || data.moonset) && (
        <View style={{ flexDirection: "row", marginTop: 10, gap: 16 }}>
          {data.moonrise && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
              <Moon size={14} color={isColored ? "#FCD34D" : monoColor} />
              <View>
                <ThemedText secondary style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>Orto lunar</ThemedText>
                <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>{data.moonrise}</ThemedText>
              </View>
            </View>
          )}
          {data.moonset && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
              <Moon size={14} color={isColored ? "#94A3B8" : monoColor} />
              <View>
                <ThemedText secondary style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>Ocaso lunar</ThemedText>
                <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>{data.moonset}</ThemedText>
              </View>
            </View>
          )}
        </View>
      )}
    </ThemedCard>
  );
}
