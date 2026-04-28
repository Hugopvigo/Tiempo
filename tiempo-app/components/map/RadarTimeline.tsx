import { View, TouchableOpacity } from "react-native";
import { ThemedText, useThemeContext } from "@/components/theme";
import { Play, Pause, SkipBack } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { memo } from "react";

interface RadarTimelineProps {
  timestamps: number[];
  frameIndex: number;
  pastCount: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectFrame: (idx: number) => void;
}

function formatFrameTime(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatFrameLabel(ts: number, isNowcast: boolean): string {
  const time = formatFrameTime(ts);
  if (isNowcast) return `${time} +`;
  return time;
}

export const RadarTimeline = memo(function RadarTimeline({
  timestamps,
  frameIndex,
  pastCount,
  isPlaying,
  onTogglePlay,
  onSelectFrame,
}: RadarTimelineProps) {
  const { isDark } = useThemeContext();

  if (timestamps.length === 0) return null;

  const currentTs = timestamps[frameIndex] ?? 0;
  const isNowcast = frameIndex >= pastCount;
  const accentColor = isDark ? "#5AC8FA" : "#007AFF";
  const trackColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  return (
    <View
      style={{
        position: "absolute",
        bottom: 148,
        left: 12,
        right: 12,
        backgroundColor: isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.92)",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={() => {
            if (isPlaying) onTogglePlay();
            onSelectFrame(0);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SkipBack size={14} color={isDark ? "#fff" : "#000"} fill={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTogglePlay}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: accentColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPlaying ? (
            <Pause size={16} color="#fff" fill="#fff" />
          ) : (
            <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Slider
            style={{ width: "100%", height: 28 }}
            minimumValue={0}
            maximumValue={timestamps.length - 1}
            step={1}
            value={frameIndex >= 0 ? frameIndex : timestamps.length - 1}
            onValueChange={onSelectFrame}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor={trackColor}
            thumbTintColor={accentColor}
          />
        </View>

        <View style={{ minWidth: 52, alignItems: "flex-end" }}>
          <ThemedText
            style={{
              fontSize: 13,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
              color: isNowcast ? "#FF9500" : undefined,
            }}
          >
            {formatFrameLabel(currentTs, isNowcast)}
          </ThemedText>
          <ThemedText
            secondary
            style={{ fontSize: 10 }}
          >
            {isNowcast ? "Predicción" : "Pasado"}
          </ThemedText>
        </View>
      </View>

      {pastCount > 0 && pastCount < timestamps.length && (
        <View
          style={{
            flexDirection: "row",
            marginTop: 4,
            marginHorizontal: 80,
          }}
        >
          <View
            style={{
              flex: pastCount,
              height: 2,
              backgroundColor: accentColor,
              borderRadius: 1,
              opacity: 0.4,
            }}
          />
          <View
            style={{
              width: 1,
              height: 6,
              backgroundColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
              marginTop: -2,
            }}
          />
          <View
            style={{
              flex: timestamps.length - pastCount,
              height: 2,
              backgroundColor: "#FF9500",
              borderRadius: 1,
              opacity: 0.4,
            }}
          />
        </View>
      )}
    </View>
  );
});
