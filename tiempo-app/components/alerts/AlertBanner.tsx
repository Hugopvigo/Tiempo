import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText, useThemeContext } from "@/components/theme";
import type { WeatherAlert } from "@/types/weather";
import { alertColors } from "@/constants/theme";
import { AlertTriangle, ChevronRight, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { createMMKV } from "react-native-mmkv";

const alertStorage = createMMKV({ id: "tiempo-storage" });
const DISMISSED_TTL = 24 * 60 * 60 * 1000;

function loadDismissedAlerts(zoneKey: string): Set<string> {
  try {
    const json = alertStorage.getString(`dismissed-${zoneKey}`);
    if (!json) return new Set();
    const entries: Array<{ id: string; ts: number }> = JSON.parse(json);
    const cutoff = Date.now() - DISMISSED_TTL;
    return new Set(entries.filter((e) => e.ts > cutoff).map((e) => e.id));
  } catch {
    return new Set();
  }
}

function persistDismissedAlerts(zoneKey: string, dismissed: Set<string>): void {
  const now = Date.now();
  const entries = [...dismissed].map((id) => ({ id, ts: now }));
  alertStorage.set(`dismissed-${zoneKey}`, JSON.stringify(entries));
}

function extractZoneKey(alertId: string): string {
  const parts = alertId.split("-");
  if (parts.length >= 2 && parts[0] === "aemet") {
    return parts[1];
  }
  return "local";
}

interface AlertBannerProps {
  alerts: WeatherAlert[];
  onDismiss?: () => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const { isDark } = useThemeContext();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [zoneKey, setZoneKey] = useState<string>("default");
  const dismissRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (alerts.length > 0) {
      const key = extractZoneKey(alerts[0].id);
      setZoneKey(key);
      setDismissed(loadDismissedAlerts(key));
    }
  }, [alerts]);

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistDismissedAlerts(zoneKey, next);
        return next;
      });
      onDismiss?.();
    },
    [zoneKey, onDismiss]
  );

  const active = alerts.filter((a) => !dismissed.has(a.id));
  if (active.length === 0) return null;

  const top = active[0];
  const color = alertColors[top.severity];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (dismissRef.current) {
          dismissRef.current = false;
          return;
        }
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
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

      <TouchableOpacity
        onPress={() => {
          dismissRef.current = true;
          handleDismiss(top.id);
        }}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        style={{
          position: "absolute",
          top: 10,
          right: 8,
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
        }}
      >
        <X size={20} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
      </TouchableOpacity>
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
  const { isDark } = useThemeContext();
  const color = alertColors[alert.severity];

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
        color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
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
