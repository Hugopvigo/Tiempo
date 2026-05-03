import { useEffect, useMemo, useRef } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import type { WeatherCondition } from "@/types/weather";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface WeatherParticlesProps {
  condition: WeatherCondition;
  isDark: boolean;
}

interface ParticleConfig {
  type: "rain" | "snow" | "fog" | "sparkle" | "cloud" | "none";
  count: number;
}

function getParticleConfig(condition: WeatherCondition): ParticleConfig {
  switch (condition) {
    case "rain":
      return { type: "rain", count: 30 };
    case "storm":
      return { type: "rain", count: 40 };
    case "snow":
      return { type: "snow", count: 20 };
    case "fog":
      return { type: "fog", count: 8 };
    case "clear":
      return { type: "sparkle", count: 10 };
    case "night_clear":
      return { type: "sparkle", count: 15 };
    case "partly_cloudy":
    case "night_cloudy":
      return { type: "cloud", count: 3 };
    case "cloudy":
      return { type: "cloud", count: 5 };
    default:
      return { type: "none", count: 0 };
  }
}

interface RainDropProps {
  x: number;
  delay: number;
  duration: number;
  isDark: boolean;
  isStorm: boolean;
}

function RainDrop({ x, delay, duration, isDark, isStorm }: RainDropProps) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);

  const dropColor = isDark
    ? isStorm ? "rgba(147,197,253,0.6)" : "rgba(147,197,253,0.5)"
    : isStorm ? "rgba(37,99,235,0.5)" : "rgba(59,130,246,0.45)";

  const dropHeight = isStorm ? 22 : 16;
  const dropWidth = isStorm ? 1.8 : 1.4;
  const windOffset = isStorm ? 6 : 3;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 40, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.8, { duration: duration - 400 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      )
    );
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: windOffset },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: 0,
          width: dropWidth,
          height: dropHeight,
          backgroundColor: dropColor,
          borderRadius: 1,
        },
        animatedStyle,
      ]}
    />
  );
}

interface SnowFlakeProps {
  x: number;
  delay: number;
  duration: number;
  size: number;
  isDark: boolean;
}

function SnowFlake({ x, delay, duration, size, isDark }: SnowFlakeProps) {
  const translateY = useSharedValue(-10);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const flakeColor = isDark
    ? "rgba(255,255,255,0.8)"
    : "rgba(200,215,240,0.9)";

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 20, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: duration * 0.25, easing: Easing.inOut(Easing.sin) }),
          withTiming(-15, { duration: duration * 0.25, easing: Easing.inOut(Easing.sin) }),
          withTiming(10, { duration: duration * 0.25, easing: Easing.inOut(Easing.sin) }),
          withTiming(-10, { duration: duration * 0.25, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 300 }),
          withTiming(0.9, { duration: duration - 600 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: 0,
          width: size,
          height: size,
          backgroundColor: flakeColor,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

interface FogPuffProps {
  x: number;
  delay: number;
  duration: number;
  size: number;
  isDark: boolean;
}

function FogPuff({ x, delay, duration, size, isDark }: FogPuffProps) {
  const translateX = useSharedValue(-size);
  const opacity = useSharedValue(0);

  const fogColor = isDark ? "rgba(148,163,184,0.15)" : "rgba(180,200,220,0.35)";

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_WIDTH + size, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.2 }),
          withTiming(1, { duration: duration * 0.6 }),
          withTiming(0, { duration: duration * 0.2 })
        ),
        -1,
        false
      )
    );
    return () => {
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -size,
          top: SCREEN_HEIGHT * 0.15 + (x % 3) * (SCREEN_HEIGHT * 0.25),
          width: size,
          height: size * 0.5,
          backgroundColor: fogColor,
          borderRadius: size * 0.25,
        },
        animatedStyle,
      ]}
    />
  );
}

interface SparkleProps {
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

function Sparkle({ x, y, delay, duration, color, size }: SparkleProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 0.25, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: duration * 0.5, easing: Easing.linear }),
          withTiming(0, { duration: duration * 0.25, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(opacity);
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

interface CloudPuffProps {
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  topOffset: number;
}

function CloudPuff({ x, delay, duration, size, color, topOffset }: CloudPuffProps) {
  const translateX = useSharedValue(-size);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_WIDTH + size, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration * 0.15 }),
          withTiming(0.6, { duration: duration * 0.7 }),
          withTiming(0, { duration: duration * 0.15 })
        ),
        -1,
        false
      )
    );
    return () => {
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -size,
          top: topOffset,
          width: size,
          height: size * 0.45,
          backgroundColor: color,
          borderRadius: size * 0.25,
        },
        animatedStyle,
      ]}
    />
  );
}

interface LightningFlashProps {
  active: boolean;
}

function LightningFlash({ active }: LightningFlashProps) {
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      flashOpacity.value = 0;
      cancelAnimation(flashOpacity);
      return;
    }

    const triggerFlash = () => {
      flashOpacity.value = withSequence(
        withTiming(0.7, { duration: 80 }),
        withTiming(0, { duration: 150 }),
        withTiming(0.4, { duration: 60 }),
        withTiming(0, { duration: 200 })
      );
    };

    triggerFlash();

    const interval = setInterval(() => {
      triggerFlash();
    }, 4000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  if (!active) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.9)",
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function WeatherParticles({ condition, isDark }: WeatherParticlesProps) {
  const config = useMemo(() => getParticleConfig(condition), [condition]);
  const isStorm = condition === "storm";
  const containerOpacity = useSharedValue(0);
  const prevType = useRef(config.type);

  useEffect(() => {
    if (config.type !== "none") {
      containerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    } else {
      containerOpacity.value = withTiming(0, { duration: 300 });
    }
    prevType.current = config.type;
  }, [config.type]);

  const particles = useMemo(() => {
    if (config.type === "none") return null;

    const items: React.ReactNode[] = [];

    if (config.type === "rain") {
      for (let i = 0; i < config.count; i++) {
        const x = seededRandom(i * 7 + 1) * SCREEN_WIDTH;
        const delay = seededRandom(i * 13 + 3) * 2000;
        const duration = 600 + seededRandom(i * 17 + 5) * 400;
        items.push(
          <RainDrop
            key={`rain-${i}`}
            x={x}
            delay={delay}
            duration={duration}
            isDark={isDark}
            isStorm={isStorm}
          />
        );
      }
    }

    if (config.type === "snow") {
      for (let i = 0; i < config.count; i++) {
        const x = seededRandom(i * 11 + 2) * SCREEN_WIDTH;
        const delay = seededRandom(i * 19 + 7) * 4000;
        const duration = 4000 + seededRandom(i * 23 + 11) * 4000;
        const size = 3 + seededRandom(i * 29 + 13) * 4;
        items.push(
          <SnowFlake
            key={`snow-${i}`}
            x={x}
            delay={delay}
            duration={duration}
            size={size}
            isDark={isDark}
          />
        );
      }
    }

    if (config.type === "fog") {
      for (let i = 0; i < config.count; i++) {
        const x = seededRandom(i * 31 + 17) * SCREEN_WIDTH * 0.5;
        const delay = seededRandom(i * 37 + 23) * 8000;
        const duration = 12000 + seededRandom(i * 41 + 29) * 8000;
        const size = 200 + seededRandom(i * 43 + 31) * 200;
        items.push(
          <FogPuff
            key={`fog-${i}`}
            x={x}
            delay={delay}
            duration={duration}
            size={size}
            isDark={isDark}
          />
        );
      }
    }

    if (config.type === "sparkle") {
      const isNight = condition === "night_clear";
      for (let i = 0; i < config.count; i++) {
        const x = seededRandom(i * 47 + 3) * SCREEN_WIDTH;
        const y = seededRandom(i * 53 + 7) * SCREEN_HEIGHT * 0.6;
        const delay = seededRandom(i * 59 + 11) * 3000;
        const duration = 2000 + seededRandom(i * 61 + 13) * 3000;
        const size = isNight ? 2 : 3 + seededRandom(i * 67 + 17) * 2;
        const color = isNight
          ? "rgba(255,255,255,0.9)"
          : seededRandom(i * 71 + 19) > 0.5
            ? "rgba(255,230,150,0.85)"
            : "rgba(255,200,100,0.7)";
        items.push(
          <Sparkle
            key={`sparkle-${i}`}
            x={x}
            y={y}
            delay={delay}
            duration={duration}
            color={color}
            size={size}
          />
        );
      }
    }

    if (config.type === "cloud") {
      const isNight = condition === "night_cloudy";
      const isOvercast = condition === "cloudy";
      for (let i = 0; i < config.count; i++) {
        const x = seededRandom(i * 73 + 5) * SCREEN_WIDTH * 0.4;
        const delay = seededRandom(i * 79 + 9) * 6000;
        const duration = 15000 + seededRandom(i * 83 + 13) * 10000;
        const size = 180 + seededRandom(i * 89 + 17) * 180;
        const topOffset = SCREEN_HEIGHT * (0.05 + seededRandom(i * 97 + 21) * 0.15);
        let color: string;
        if (isNight) {
          color = isDark ? "rgba(30,40,60,0.25)" : "rgba(60,70,90,0.2)";
        } else if (isOvercast) {
          color = isDark ? "rgba(60,70,85,0.2)" : "rgba(140,150,165,0.25)";
        } else {
          color = isDark ? "rgba(180,190,210,0.15)" : "rgba(220,230,245,0.3)";
        }
        items.push(
          <CloudPuff
            key={`cloud-${i}`}
            x={x}
            delay={delay}
            duration={duration}
            size={size}
            color={color}
            topOffset={topOffset}
          />
        );
      }
    }

    return items;
  }, [config, isDark, isStorm, condition]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        },
        containerAnimatedStyle,
      ]}
      pointerEvents="none"
    >
      {particles}
      <LightningFlash active={isStorm} />
    </Animated.View>
  );
}
