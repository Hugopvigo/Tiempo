import { FlexWidget, TextWidget, SvgWidget } from "react-native-android-widget";
import type { WidgetWeatherData, WidgetDailyForecast } from "./widgetStorage";
import type { WidgetBackground } from "./WeatherWidget";

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "HOY";
  return date
    .toLocaleDateString("es-ES", { weekday: "short" })
    .toUpperCase()
    .replace(".", "");
}

function rainColor(pct: number): string {
  if (pct < 10) return "#BFDBFE";
  if (pct < 25) return "#93C5FD";
  if (pct < 50) return "#60A5FA";
  if (pct < 70) return "#3B82F6";
  if (pct < 85) return "#2563EB";
  return "#1D4ED8";
}

function getColors(background: WidgetBackground) {
  if (background === "transparent") return {
    bg: "rgba(0, 0, 0, 0)",
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.65)",
    barEmpty: null as null,
  } as const;
  if (background === "dark") return {
    bg: "#0F172A",
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    barEmpty: "#1E293B" as "#1E293B",
  } as const;
  return {
    bg: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#64748B",
    barEmpty: "#E2E8F0" as "#E2E8F0",
  } as const;
}

function buildSvg(
  days: WidgetDailyForecast[],
  primary: string,
  secondary: string,
  barEmpty: string | null
): string {
  const W = 280;
  const CHART_TOP = 4;
  const CHART_BOTTOM = 56;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const SVG_H = 84;
  const colW = W / days.length;
  const barW = Math.round(colW * 0.42);

  const content = days
    .map((day, i) => {
      const cx = Math.round(colW * i + colW / 2);
      const pct = Math.round(day.precipitationChance);
      const barH = Math.max(4, Math.round((pct / 100) * CHART_H));
      const barY = CHART_BOTTOM - barH;
      const barX = Math.round(cx - barW / 2);
      const emptyH = CHART_H - barH;
      const label = getDayLabel(day.date);

      const emptyRect =
        barEmpty && emptyH > 0
          ? `<rect x="${barX}" y="${CHART_TOP}" width="${barW}" height="${emptyH}" rx="4" fill="${barEmpty}"/>`
          : "";

      const filledRect = `<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="4" fill="${rainColor(pct)}"/>`;

      const dayText = `<text x="${cx}" y="70" text-anchor="middle" font-size="10" font-weight="600" fill="${secondary}">${label}</text>`;

      const pctText = `<text x="${cx}" y="${SVG_H}" text-anchor="middle" font-size="12" font-weight="700" fill="${primary}">${pct}%</text>`;

      return emptyRect + filledRect + dayText + pctText;
    })
    .join("");

  return `<svg viewBox="0 0 ${W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
}

export function RainWidget({ data, background }: Props) {
  const c = getColors(background);

  if (!data || !data.forecast?.length) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <TextWidget text="Sin datos" style={{ color: c.secondary, fontSize: 14 }} />
      </FlexWidget>
    );
  }

  const days = data.forecast.slice(0, 5);
  const svg = buildSvg(days, c.primary, c.secondary, c.barEmpty);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: c.bg,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: 12,
        paddingBottom: 10,
        paddingLeft: 14,
        paddingRight: 14,
      }}
    >
      <TextWidget
        text={data.cityName.toUpperCase() + " · LLUVIA"}
        style={{
          color: c.secondary,
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.8,
        }}
        maxLines={1}
        truncate="END"
      />
      <FlexWidget style={{ flex: 1, marginTop: 6 }}>
        <SvgWidget
          svg={svg}
          style={{ width: "match_parent", height: "match_parent" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
