import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useThemeContext } from "@/components/theme";

function useShimmer() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return opacity;
}

function SkeletonBox({ width, height, borderRadius = 12 }: { width: number | string; height: number; borderRadius?: number }) {
  const shimmer = useShimmer();
  const { isDark } = useThemeContext();
  const color = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: color,
        opacity: shimmer,
      }}
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
