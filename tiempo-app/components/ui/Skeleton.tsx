import { View } from "react-native";
import { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, cancelAnimation } from "react-native-reanimated";
import { useThemeContext } from "@/components/theme";

function useShimmer() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
    return () => cancelAnimation(opacity);
  }, []);

  return opacity;
}

function SkeletonBox({ width, height, borderRadius = 12 }: { width: number | string; height: number; borderRadius?: number }) {
  const shimmer = useShimmer();
  const { isDark } = useThemeContext();
  const color = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";

  const animatedStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function CurrentWeatherSkeleton() {
  return (
    <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
      <SkeletonBox width={140} height={28} />
      <SkeletonBox width={120} height={110} borderRadius={16} />
      <SkeletonBox width={160} height={20} />
      <SkeletonBox width={120} height={18} />
    </View>
  );
}

export function HourlyForecastSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width={120} height={16} borderRadius={8} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox key={i} width={64} height={80} />
        ))}
      </View>
    </View>
  );
}

export function DailyForecastSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width={120} height={16} borderRadius={8} />
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBox key={i} width="100%" height={32} borderRadius={8} />
      ))}
    </View>
  );
}

export function WeatherDetailsSkeleton() {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonBox width="50%" height={130} />
        <SkeletonBox width="50%" height={130} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonBox width="50%" height={130} />
        <SkeletonBox width="50%" height={130} />
      </View>
    </View>
  );
}

export function SeaConditionSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width={120} height={16} borderRadius={8} />
      <SkeletonBox width={160} height={32} borderRadius={8} />
      <SkeletonBox width={240} height={18} borderRadius={8} />
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        <SkeletonBox width="33%" height={60} />
        <SkeletonBox width="33%" height={60} />
        <SkeletonBox width="33%" height={60} />
      </View>
    </View>
  );
}

export function TideChartSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width={160} height={16} borderRadius={8} />
      <SkeletonBox width="100%" height={180} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SkeletonBox width={80} height={14} borderRadius={6} />
        <SkeletonBox width={80} height={14} borderRadius={6} />
      </View>
    </View>
  );
}

export function TideTableSkeleton() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonBox width={100} height={16} borderRadius={8} />
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBox key={i} width="100%" height={36} borderRadius={8} />
      ))}
    </View>
  );
}
