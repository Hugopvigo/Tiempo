import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/theme";
import type { WeatherAlert } from "@/types/weather";
import { alertColors, alertInk } from "@/constants/theme";
import { X } from "lucide-react-native";
import { ALERT_ICON } from "./alertIcon";
import { periodLabel, alertDetailUrl, alertKicker, alertHeadline } from "@/utils/alertFormat";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
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
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [zoneKey, setZoneKey] = useState<string>("default");
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
  const Icon = ALERT_ICON[top.type];
  const period = periodLabel(top.startTime, top.endTime);
  const extra = active.length - 1;

  return (
    <View style={{ marginBottom: 4 }}>
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${alertKicker(top)}. ${alertHeadline(top)}. Ver el aviso`}
        onPress={() => router.push(alertDetailUrl(top) as never)}
        style={{ backgroundColor: color, borderRadius: 20, padding: 16, gap: 8 }}
      >
        {/* Margen derecho: sitio para el botón de cerrar. */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 36 }}>
          <Icon size={18} color={alertInk} strokeWidth={2.2} />
          <ThemedText style={{ fontSize: 14, fontWeight: "600", color: alertInk, flexShrink: 1 }} numberOfLines={2}>
            {alertKicker(top)}
          </ThemedText>
        </View>

        <ThemedText style={{ fontSize: 20, lineHeight: 25, fontWeight: "700", color: alertInk }} numberOfLines={3}>
          {alertHeadline(top)}
        </ThemedText>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <ThemedText style={{ fontSize: 14, fontWeight: "600", color: alertInk, flexShrink: 1 }}>
            {extra > 0 ? `${period}. Y ${extra} más` : period}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, fontWeight: "600", color: alertInk, textDecorationLine: "underline" }}>
            Ver el aviso
          </ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDismiss(top.id)}
        accessibilityRole="button"
        accessibilityLabel="Ocultar este aviso"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={20} color={alertInk} />
      </TouchableOpacity>
    </View>
  );
}
