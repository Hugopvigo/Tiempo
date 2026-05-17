import { FlexWidget, TextWidget, SvgWidget } from "react-native-android-widget";
import type { WidgetWeatherData, WidgetDailyForecast } from "./widgetStorage";
import { getColors, staleLabel } from "./widgetTheme";
import type { WidgetBackground } from "./widgetTheme";

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "HOY";
  return date
    .toLocaleDateString("es-ES", { weekday: "short" })
    .toUpperCase()
    .replace(".", "");
}

// Base design dimensions (4x2 target: ~294x146dp)
const BASE_W = 294;
const BASE_H = 146;

function getScale(width: number, height: number): number {
  if (!width || !height) return 1;
  return Math.max(0.7, Math.min(2.5, Math.min(width / BASE_W, height / BASE_H)));
}

function s(value: number, scale: number): number {
  return Math.round(value * scale);
}

function buildLineSvg(
  days: WidgetDailyForecast[],
  primary: string,
  secondary: string,
  line: string,
  dot: string,
): string {
  const W = 280;
  const H = 88;
  const CHART_TOP = 22;
  const CHART_BOTTOM = 62;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const colW = W / days.length;

  const points = days.map((day, i) => {
    const cx = Math.round(colW * i + colW / 2);
    const pct = Math.round(day.precipitationChance);
    // y=CHART_TOP at 100%, y=CHART_BOTTOM at 0%
    const cy = Math.round(CHART_BOTTOM - (pct / 100) * CHART_H);
    return { cx, cy, pct, label: getDayLabel(day.date) };
  });

  const polylinePoints = points.map((p) => `${p.cx},${p.cy}`).join(" ");

  const firstX = points[0].cx;
  const lastX = points[points.length - 1].cx;
  const areaPath =
    `M${firstX},${CHART_BOTTOM} ` +
    points.map((p) => `L${p.cx},${p.cy}`).join(" ") +
    ` L${lastX},${CHART_BOTTOM} Z`;

  const elements: string[] = [
    `<path d="${areaPath}" fill="${line}" fill-opacity="0.15"/>`,
    `<polyline points="${polylinePoints}" fill="none" stroke="${line}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];

  for (const p of points) {
    elements.push(`<circle cx="${p.cx}" cy="${p.cy}" r="4.5" fill="${line}"/>`);
    elements.push(`<circle cx="${p.cx}" cy="${p.cy}" r="2" fill="${dot}"/>`);
    // % label above the dot, clamped so it doesn't clip at the top of the viewBox
    const labelY = Math.max(13, p.cy - 8);
    elements.push(
      `<text x="${p.cx}" y="${labelY}" text-anchor="middle" font-size="11" font-weight="700" fill="${primary}">${p.pct}%</text>`,
    );
    elements.push(
      `<text x="${p.cx}" y="${H}" text-anchor="middle" font-size="10" font-weight="600" fill="${secondary}">${p.label}</text>`,
    );
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elements.join("")}</svg>`;
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function RainWidget({ data, background, width = BASE_W, height = BASE_H }: Props) {
  const c = getColors(background);
  const scale = getScale(width, height);

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
        clickAction="OPEN_APP"
      >
        <TextWidget text="Sin datos" style={{ color: c.secondary, fontSize: s(14, scale) }} />
      </FlexWidget>
    );
  }

  const days = data.forecast.slice(0, 7);
  const titleText = data.cityName.toUpperCase() + " · LLUVIA" + staleLabel(data.updatedAt);
  const svg = buildLineSvg(days, c.primary, c.secondary, c.line, c.dot);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: c.bg,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: s(12, scale),
        paddingBottom: s(10, scale),
        paddingLeft: s(14, scale),
        paddingRight: s(14, scale),
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={titleText}
        style={{
          color: c.secondary,
          fontSize: s(10, scale),
          fontWeight: "600",
          letterSpacing: 0.8,
        }}
        maxLines={1}
        truncate="END"
      />
      <FlexWidget style={{ flex: 1, marginTop: s(6, scale) }}>
        <SvgWidget
          svg={svg}
          style={{ width: "match_parent", height: "match_parent" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
