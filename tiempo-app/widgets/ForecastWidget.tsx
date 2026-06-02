import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData, WidgetDailyForecast } from "./widgetStorage";
import { getColors, staleLabel } from "./widgetTheme";
import type { WidgetBackground } from "./widgetTheme";

const CONDITION_EMOJI: Record<string, string> = {
  clear: "☀️",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  rain: "🌧️",
  storm: "⛈️",
  snow: "❄️",
  fog: "🌫️",
  night_clear: "🌙",
  night_cloudy: "🌑",
};

const DAYS_TO_SHOW = 5;

function fmt(temp: number, unit: "celsius" | "fahrenheit"): string {
  if (unit === "fahrenheit") return `${Math.round(temp * 9 / 5 + 32)}°`;
  return `${Math.round(temp)}°`;
}

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
 * Font sizes are based on estimated COLUMN WIDTH, not widget height.
 * This prevents truncation regardless of how many columns are shown.
 *
 * Android under-reports width in portrait (MIN_WIDTH). For a 4×2 widget
 * the real width ≈ 2×height, so we use max(reported, height×2) as floor.
 */
function sizes(w: number, h: number) {
  const safeH  = Math.max(70, Math.min(h, 210));
  // Best-guess total width: never let under-reporting shrink fonts
  const estW   = Math.max(w, safeH * 2);
  const padH   = Math.round(safeH * 0.06);
  const padV   = Math.round(safeH * 0.06);
  // Column width available to each day (5 cols + small gaps)
  const colW   = Math.max(30, Math.round((estW - padH * 2) / DAYS_TO_SHOW));

  return {
    padV,
    padH,
    title:   Math.round(safeH * 0.08),
    titleMB: Math.round(safeH * 0.035),
    // All per-column text sized from colW so they always fit
    day:     Math.round(colW * 0.22),
    emoji:   Math.round(colW * 0.34),
    emojiMT: Math.round(colW * 0.04),
    emojiMB: Math.round(colW * 0.04),
    tMax:    Math.round(colW * 0.26),
    tMin:    Math.round(colW * 0.23),
    tMinMB:  Math.round(colW * 0.02),
    rain:    Math.round(colW * 0.20),
  };
}

function DayColumn({
  day,
  unit,
  colors,
  sz,
}: {
  day: WidgetDailyForecast;
  unit: "celsius" | "fahrenheit";
  colors: ReturnType<typeof getColors>;
  sz: ReturnType<typeof sizes>;
}) {
  const emoji = CONDITION_EMOJI[day.condition] ?? "🌡️";
  const label = getDayLabel(day.date);
  const rain = day.precipitationChance > 0 ? `${Math.round(day.precipitationChance)}%` : "—";

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: "match_parent",
      }}
    >
      <TextWidget
        text={label}
        style={{ color: colors.secondary, fontSize: sz.day, fontWeight: "600" }}
        maxLines={1}
        truncate="END"
      />
      <TextWidget
        text={emoji}
        style={{ fontSize: sz.emoji, marginTop: sz.emojiMT, marginBottom: sz.emojiMB }}
        maxLines={1}
      />
      <TextWidget
        text={fmt(day.tempMax, unit)}
        style={{ color: colors.primary, fontSize: sz.tMax, fontWeight: "700" }}
        maxLines={1}
      />
      <TextWidget
        text={fmt(day.tempMin, unit)}
        style={{ color: colors.secondary, fontSize: sz.tMin, marginBottom: sz.tMinMB }}
        maxLines={1}
      />
      <TextWidget
        text={rain}
        style={{ color: colors.rain, fontSize: sz.rain, fontWeight: "500" }}
        maxLines={1}
      />
    </FlexWidget>
  );
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
  width?: number;
  height?: number;
  screenW?: number;
}

export function ForecastWidget({ data, background, width = 294, height = 146, screenW = 0 }: Props) {
  const c = getColors(background);
  // screenW is reliable (actual device screen width). Use it as floor for widget width.
  // A 4-wide widget on a full-width launcher ≈ screenW * 0.93 (small edge margins).
  const effectiveW = screenW > 0 ? Math.round(screenW * 0.93) : width;
  const sz = sizes(effectiveW, height);

  // Fixed 5-day forecast (matches widget label). Columns are flex:1 so they
  // always fill the real slot width regardless of how Android reports `width`,
  // which is unreliable in portrait (reports MIN_WIDTH, often under-estimated).
  const daysToShow = DAYS_TO_SHOW;

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

  const days = data.forecast.slice(0, daysToShow);
  const cityText = data.cityName.toUpperCase() + staleLabel(data.updatedAt);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
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
        text={cityText}
        style={{
          color: c.secondary,
          fontSize: sz.title,
          fontWeight: "600",
          letterSpacing: 0.8,
          marginBottom: sz.titleMB,
        }}
        maxLines={1}
        truncate="END"
      />
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        {days.map((day) => (
          <DayColumn key={day.date} day={day} unit={data.unit} colors={c} sz={sz} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
