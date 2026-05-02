import Animated, { FadeInDown } from "react-native-reanimated";
import type { ReactNode } from "react";

interface AnimatedViewProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedView({ children, delay = 0 }: AnimatedViewProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
    >
      {children}
    </Animated.View>
  );
}
