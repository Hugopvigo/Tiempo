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

/**
 * All sizes derived purely from actual widget dimensions.
 * No fixed base, no artificial clamping — scales to any size Android gives.
 */
function sizes(w: number, h: number) {
  // Cap height by the 4x2 aspect ratio (2.01) so fonts never outgrow horizontal space
  const ref = Math.min(h, w / 2.01);
  const height = Math.max(50, ref);
  return {
    padV:  Math.round(height * 0.082),
    padH:  Math.round(height * 0.096),
    title: Math.round(height * 0.075),
    gap:   Math.round(height * 0.041),
  };
}

/**
 * Builds the rain SVG at the actual available pixel dimensions
 * so it fills the widget regardless of its size.
 */
function buildLineSvg(
  days: WidgetDailyForecast[],
  svgW: number,
  svgH: number,
  primary: string,
  secondary: string,
  line: string,
  dot: string,
): string {
  const W = Math.max(100, svgW);
  const H = Math.max(40, svgH);

  // Leave room for labels at top and bottom
  const labelTopH = Math.round(H * 0.18);
  const labelBotH = Math.round(H * 0.15);
  const CHART_TOP = labelTopH;
  const CHART_BOTTOM = H - labelBotH;
  const CHART_H = CHART_BOTTOM - CHART_TOP;

  const colW = W / days.length;
  const fontSize = Math.round(H * 0.13);
  const dotR = Math.max(3, Math.round(H * 0.055));
  const dotInner = Math.max(1.5, Math.round(H * 0.025));
  const strokeW = Math.max(1.5, Math.round(H * 0.028));

  const points = days.map((day, i) => {
    const cx = Math.round(colW * i + colW / 2);
    const pct = Math.round(day.precipitationChance);
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
    `<polyline points="${polylinePoints}" fill="none" stroke="${line}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];

  for (const p of points) {
    elements.push(`<circle cx="${p.cx}" cy="${p.cy}" r="${dotR}" fill="${line}"/>`);
    elements.push(`<circle cx="${p.cx}" cy="${p.cy}" r="${dotInner}" fill="${dot}"/>`);
    const labelY = Math.max(fontSize, p.cy - dotR - 2);
    elements.push(
      `<text x="${p.cx}" y="${labelY}" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="${primary}">${p.pct}%</text>`,
    );
    elements.push(
      `<text x="${p.cx}" y="${H}" text-anchor="middle" font-size="${fontSize}" font-weight="600" fill="${secondary}">${p.label}</text>`,
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

export function RainWidget({ data, background, width = 294, height = 146 }: Props) {
  const c = getColors(background);
  const sz = sizes(width, height);

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
        <TextWidget text="Sin datos" style={{ color: c.secondary, fontSize: sz.title }} />
      </FlexWidget>
    );
  }

  const days = data.forecast.slice(0, 7);
  const titleText = data.cityName.toUpperCase() + " · LLUVIA" + staleLabel(data.updatedAt);

  // Compute available SVG area after padding and title
  const titleLineH = Math.round(sz.title * 1.4); // approx line height
  const svgW = Math.max(60, width - sz.padH * 2);
  const svgH = Math.max(30, height - sz.padV * 2 - titleLineH - sz.gap);

  const svg = buildLineSvg(days, svgW, svgH, c.primary, c.secondary, c.line, c.dot);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: c.bg,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: sz.padV,
        paddingBottom: sz.padV,
        paddingLeft: sz.padH,
        paddingRight: sz.padH,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={titleText}
        style={{
          color: c.secondary,
          fontSize: sz.title,
          fontWeight: "600",
          letterSpacing: 0.8,
        }}
        maxLines={1}
        truncate="END"
      />
      <FlexWidget style={{ flex: 1, marginTop: sz.gap }}>
        <SvgWidget
          svg={svg}
          style={{ width: "match_parent", height: "match_parent" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
