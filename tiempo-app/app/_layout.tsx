import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { screenBackground } from "@/constants/theme";
import { useState, Component, type ReactNode, type ErrorInfo, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { configureAEMET } from "@/services/aemet";
import { useSettingsStore } from "@/stores/cityStore";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>⚠️</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>Algo salió mal</Text>
          <Text style={{ fontSize: 14, marginTop: 8, textAlign: "center", color: "#888" }}>
            La app se ha recuperado del error
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#007AFF", borderRadius: 20 }}
          >
            <Text style={{ color: "#FFF", fontWeight: "500" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const { isDark } = useTheme();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (settings.aemetApiKey) {
      configureAEMET(settings.aemetApiKey);
    }
  }, [settings.aemetApiKey]);
  const [queryClient] = useState(
    () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 5 * 60 * 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider isDark={isDark}>
        <ErrorBoundary>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            animationDuration: 220,
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
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
