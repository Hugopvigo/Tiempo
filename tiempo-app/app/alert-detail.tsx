import { View, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext, ThemedText, ThemedCard, DynamicBackground } from "@/components/theme";
import { useLocalSearchParams, Stack } from "expo-router";
import type { WeatherAlert } from "@/types/weather";
import { alertColors } from "@/constants/theme";
import { AlertTriangle, Clock, Shield, ExternalLink } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export default function AlertDetailScreen() {
  const { isDark } = useThemeContext();
  const params = useLocalSearchParams();

  const validSeverities = ["yellow", "orange", "red"] as const;
  const validTypes = ["rain", "storm", "snow", "wind", "heat", "cold", "coastal", "fog"] as const;

  const severity = validSeverities.find((s) => s === params.severity) ?? "yellow";
  const type = validTypes.find((t) => t === params.type) ?? "rain";

  const alert: WeatherAlert = {
    id: (params.id as string) ?? "",
    title: (params.title as string) ?? "Aviso",
    description: (params.description as string) ?? "",
    severity,
    type,
    startTime: (params.startTime as string) ?? "",
    endTime: (params.endTime as string) ?? "",
  };

  const color = alertColors[alert.severity];

  return (
    <DynamicBackground condition="clear">
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Aviso meteorológico",
            headerTransparent: true,
            headerTintColor: isDark ? "#FFF" : "#1C1C1E",
            headerBackTitle: "Volver",
          }}
        />
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 100, paddingBottom: 40 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${color}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 22, fontWeight: "600" }}>
                {alert.title}
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: color,
                  }}
                />
                <ThemedText secondary style={{ fontSize: 14 }}>
                  Nivel {severityLabel(alert.severity)}
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedCard style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 15, lineHeight: 22 }}>
              {alert.description}
            </ThemedText>
          </ThemedCard>

          <ThemedCard style={{ marginBottom: 16 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Clock size={16} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
                <View>
                  <ThemedText secondary style={{ fontSize: 12 }}>Inicio</ThemedText>
                  <ThemedText style={{ fontSize: 14 }}>{formatTime(alert.startTime)}</ThemedText>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Clock size={16} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
                <View>
                  <ThemedText secondary style={{ fontSize: 12 }}>Fin</ThemedText>
                  <ThemedText style={{ fontSize: 14 }}>{formatTime(alert.endTime)}</ThemedText>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Shield size={16} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
                <View>
                  <ThemedText secondary style={{ fontSize: 12 }}>Severidad</ThemedText>
                  <ThemedText style={{ fontSize: 14, color }}>{severityLabel(alert.severity)}</ThemedText>
                </View>
              </View>
            </View>
          </ThemedCard>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.aemet.es/es/eltiempo/prediccion/avisos")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            }}
          >
            <ExternalLink size={16} color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"} />
            <ThemedText secondary style={{ fontSize: 14 }}>
              Ver avisos AEMET
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </DynamicBackground>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function severityLabel(s: WeatherAlert["severity"]): string {
  switch (s) {
    case "red":
      return "Rojo (extremo)";
    case "orange":
      return "Naranja (importante)";
    case "yellow":
      return "Amarillo (riesgo)";
  }
}
