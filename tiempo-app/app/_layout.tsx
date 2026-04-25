import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { screenBackground } from "@/constants/theme";
import { useState } from "react";

export default function RootLayout() {
  const { isDark } = useTheme();
  const [queryClient] = useState(
    () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider isDark={isDark}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: {
              backgroundColor: isDark ? screenBackground.dark : screenBackground.light,
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="search" />
          <Stack.Screen name="tides" />
          <Stack.Screen name="map" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="alert-detail" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
