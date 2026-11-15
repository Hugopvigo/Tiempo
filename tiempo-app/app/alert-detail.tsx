import { View, ScrollView, Linking, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext, ThemedText, ThemedCard, CardTitle } from "@/components/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { WeatherAlert } from "@/types/weather";
import { alertColors, alertInk, screenBackground, trackColor, textColor } from "@/constants/theme";
import { ChevronLeft, ExternalLink } from "lucide-react-native";
import { AlertZoneMap } from "@/components/alerts/AlertZoneMap";
import { UMBRAL } from "@/services/alerts";
import { severityLabel, periodLabel, countdownLabel, alertPlaceTitle } from "@/utils/alertFormat";

const SEVERITIES = ["yellow", "orange", "red"] as const;
const TYPES = ["rain", "storm", "snow", "wind", "heat", "cold", "coastal", "fog"] as const;

const RISK: Record<WeatherAlert["severity"], string> = {
  yellow: "riesgo",
  orange: "riesgo importante",
  red: "riesgo extremo",
};

// Umbrales más frecuentes del Plan Meteoalerta para los fenómenos que tienen
// uno numérico. Cada zona puede tener los suyos.
const THRESHOLDS: Partial<Record<WeatherAlert["type"], { values: readonly number[]; unit: string }>> = {
  rain: { values: UMBRAL.lluvia1h, unit: "mm en 1 h" },
  snow: { values: UMBRAL.nieve24h, unit: "cm en 24 h" },
  wind: { values: UMBRAL.racha, unit: "km/h de racha" },
  heat: { values: UMBRAL.tempMax, unit: "°C de máxima" },
  cold: { values: UMBRAL.tempMin, unit: "°C de mínima" },
};

// Tonos suaves de cada nivel para las casillas de umbral que no son el actual.
const SOFT: Record<WeatherAlert["severity"], string> = {
  yellow: "#FFF4B8",
  orange: "#FFE2B8",
  red: "#FFD9D6",
};

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parsePolygons(json: string | undefined): [number, number][][] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function parsePoint(text: string | undefined): { lat: number; lon: number } | undefined {
  const [lat, lon] = (text ?? "").split(",").map(Number);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;
}

function dayTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const day =
    d.toDateString() === now.toDateString() ? "Hoy"
    : d.toDateString() === tomorrow.toDateString() ? "Mañana"
    : d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
  return `${day}, ${time}`;
}

export default function AlertDetailScreen() {
  const { isDark } = useThemeContext();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const alert: WeatherAlert = {
    id: str(params.id) ?? "",
    title: str(params.title) ?? "Aviso",
    description: str(params.description) ?? "",
    severity: SEVERITIES.find((s) => s === params.severity) ?? "yellow",
    type: TYPES.find((t) => t === params.type) ?? "rain",
    startTime: str(params.startTime) ?? "",
    endTime: str(params.endTime) ?? "",
    source: params.source === "aemet" ? "aemet" : "local",
    zone: str(params.zone),
    detail: str(params.detail),
  };
  const polygons = parsePolygons(str(params.polygons));
  const point = parsePoint(str(params.point));

  const color = alertColors[alert.severity];
  const official = alert.source === "aemet";
  const thresholds = THRESHOLDS[alert.type];
  const track = isDark ? trackColor.dark : trackColor.light;
  const ink = isDark ? textColor.dark : textColor.light;

  // Barra de vigencia: desde ahora (o el inicio, si ya empezó) hasta el fin,
  // con un margen a cada lado para que el tramo no toque los bordes.
  const start = new Date(alert.startTime).getTime();
  const end = new Date(alert.endTime).getTime();
  const now = Date.now();
  const hasWindow = !isNaN(start) && !isNaN(end) && end > start;
  const from = Math.min(start, now);
  const span = Math.max(end - from, 1);
  const t0 = from - span * 0.12;
  const total = span * 1.24;
  const pos = (t: number) => `${Math.min(100, Math.max(0, ((t - t0) / total) * 100))}%` as const;

  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? screenBackground.dark : screenBackground.light }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={{ backgroundColor: color, paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 20, gap: 8 }}>
          <TouchableOpacity
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={{ flexDirection: "row", alignItems: "center", gap: 2, minHeight: 44, alignSelf: "flex-start", marginLeft: -6 }}
          >
            <ChevronLeft size={22} color={alertInk} strokeWidth={2.2} />
            <ThemedText style={{ fontSize: 15, fontWeight: "600", color: alertInk }}>Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText style={{ fontSize: 14, fontWeight: "600", color: alertInk }}>
            {official
              ? `Aviso ${severityLabel(alert.severity).toLowerCase()} de AEMET, ${RISK[alert.severity]}`
              : `Previsión propia, nivel ${severityLabel(alert.severity).toLowerCase()}`}
          </ThemedText>
          <ThemedText style={{ fontSize: 32, lineHeight: 36, fontWeight: "700", color: alertInk }}>
            {alertPlaceTitle(alert)}
          </ThemedText>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {hasWindow && (
            <ThemedCard>
              <CardTitle aside={countdownLabel(alert.startTime, alert.endTime)}>
                {periodLabel(alert.startTime, alert.endTime)}
              </CardTitle>
              <View style={{ height: 18, justifyContent: "center" }}>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: track }} />
                <View style={{ position: "absolute", left: pos(start), right: `${100 - parseFloat(pos(end))}%`, height: 10, borderRadius: 5, backgroundColor: color }} />
                {now >= t0 && now <= t0 + total && (
                  <View style={{ position: "absolute", left: pos(now), marginLeft: -1.5, width: 3, height: 18, borderRadius: 2, backgroundColor: ink }} />
                )}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <ThemedText secondary style={{ fontSize: 13 }}>{`Inicio: ${dayTime(alert.startTime).toLowerCase()}`}</ThemedText>
                <ThemedText secondary style={{ fontSize: 13 }}>{`Fin: ${dayTime(alert.endTime).toLowerCase()}`}</ThemedText>
              </View>
            </ThemedCard>
          )}

          {polygons.length > 0 && (
            <ThemedCard>
              <CardTitle aside={point ? "El punto es tu ciudad" : undefined}>Zona del aviso</CardTitle>
              <AlertZoneMap polygons={polygons} point={point} color={color} />
            </ThemedCard>
          )}

          <ThemedCard style={{ gap: 12 }}>
            <View>
              <CardTitle>Qué se espera</CardTitle>
              <ThemedText style={{ fontSize: 15, lineHeight: 22 }}>
                {alert.detail ?? alert.description}
              </ThemedText>
            </View>

            {thresholds && (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {SEVERITIES.map((level, i) => {
                    const current = level === alert.severity;
                    return (
                      <View
                        key={level}
                        style={{ flex: 1, borderRadius: 10, padding: 8, gap: 2, backgroundColor: current ? alertColors[level] : SOFT[level] }}
                      >
                        <ThemedText style={{ fontSize: 12, color: alertInk, fontWeight: current ? "600" : "400" }}>
                          {current ? `${severityLabel(level)}, ahora` : severityLabel(level)}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16, fontWeight: "600", color: alertInk }}>
                          {String(thresholds.values[i])}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
                <ThemedText secondary style={{ fontSize: 12, lineHeight: 17 }}>
                  {`Umbrales habituales de AEMET, en ${thresholds.unit}. Cada zona puede tener los suyos.`}
                </ThemedText>
              </View>
            )}
          </ThemedCard>

          <ThemedText secondary style={{ fontSize: 13, lineHeight: 18, paddingHorizontal: 4 }}>
            {official
              ? "Fuente: AEMET, Agencia Estatal de Meteorología."
              : "Previsión calculada con datos de Open-Meteo. No es un aviso oficial de AEMET."}
          </ThemedText>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.aemet.es/es/eltiempo/prediccion/avisos")}
            accessibilityRole="link"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 48,
              borderRadius: 24,
              backgroundColor: ink,
            }}
          >
            <ExternalLink size={16} color={isDark ? textColor.light : textColor.dark} />
            <ThemedText style={{ fontSize: 15, fontWeight: "600", color: isDark ? textColor.light : textColor.dark }}>
              Ver los avisos en AEMET
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
