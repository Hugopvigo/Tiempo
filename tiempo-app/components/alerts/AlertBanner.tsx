import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText, useThemeContext } from "@/components/theme";
import type { WeatherAlert } from "@/types/weather";
import { alertColors } from "@/constants/theme";
import { AlertTriangle, ChevronRight, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

interface AlertBannerProps {
  alerts: WeatherAlert[];
  onDismiss?: () => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const { isDark } = useThemeContext();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  const active = alerts.filter((a) => !dismissed.has(a.id));
  if (active.length === 0) return null;

  const top = active[0];
  const color = alertColors[top.severity];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        const params = new URLSearchParams({
          id: top.id,
          title: top.title,
          description: top.description,
          severity: top.severity,
          type: top.type,
          startTime: top.startTime,
          endTime: top.endTime,
        });
        router.push(`/alert-detail?${params.toString()}`);
      }}
    >
      <View
        style={{
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: `${color}18`,
            borderWidth: 0.5,
            borderColor: `${color}40`,
            borderRadius: 14,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <AlertTriangle size={18} color={color} style={{ marginTop: 2 }} />

            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: color,
                    }}
                  />
                  <ThemedText style={{ fontSize: 14, fontWeight: "600" }}>
                    {top.title}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setDismissed((prev) => new Set(prev).add(top.id));
                    onDismiss?.();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X
                    size={16}
                    color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  />
                </TouchableOpacity>
              </View>

              <ThemedText
                secondary
                style={{ fontSize: 12, lineHeight: 17 }}
                numberOfLines={2}
              >
                {top.description}
              </ThemedText>

              {active.length > 1 && (
                <ThemedText
                  secondary
                  style={{ fontSize: 11, marginTop: 2, fontWeight: "500" }}
                >
                  +{active.length - 1} aviso{active.length - 1 > 1 ? "s" : ""} más
                </ThemedText>
              )}
            </View>

            <ChevronRight
              size={16}
              color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
              style={{ marginTop: 2 }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface AlertListProps {
  alerts: WeatherAlert[];
}

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {alerts.map((alert) => (
        <AlertRow key={alert.id} alert={alert} />
      ))}
    </ScrollView>
  );
}

function AlertRow({ alert }: { alert: WeatherAlert }) {
  const color = alertColors[alert.severity];
  const iconMap: Record<WeatherAlert["type"], string> = {
    rain: "🌧️",
    storm: "⛈️",
    snow: "❄️",
    wind: "💨",
    heat: "🌡️",
    cold: "🥶",
    coastal: "🌊",
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 14,
        backgroundColor: `${color}10`,
        borderWidth: 0.5,
        borderColor: `${color}30`,
        marginBottom: 10,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${color}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle size={18} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 14, fontWeight: "600" }}>
          {alert.title}
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 12, marginTop: 2 }}>
          {formatTime(alert.startTime)} — {formatTime(alert.endTime)}
        </ThemedText>
      </View>

      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: `${color}25`,
        }}
      >
        <ThemedText style={{ fontSize: 11, fontWeight: "600", color }}>
          {severityLabel(alert.severity)}
        </ThemedText>
      </View>

      <ChevronRight
        size={16}
        color="rgba(255,255,255,0.3)"
      />
    </TouchableOpacity>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
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
      return "Rojo";
    case "orange":
      return "Naranja";
    case "yellow":
      return "Amarillo";
  }
}
