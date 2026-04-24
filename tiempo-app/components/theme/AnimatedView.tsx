import Animated, { 
  FadeInDown, 
  Layout 
} from "react-native-reanimated";
import type { ReactNode } from "react";
import type { ViewProps } from "react-native";

interface AnimatedViewProps extends ViewProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedView({ children, delay = 0, style, ...props }: AnimatedViewProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify().damping(15)}
      layout={Layout.springify()}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
