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
 * All sizes derived purely from actual widget dimensions.
 * No fixed base, no artificial clamping — scales to any size Android gives.
 */
function sizes(w: number, h: number) {
  // Cap height by the 4x2 aspect ratio (2.01) so fonts never outgrow horizontal space
  const ref = Math.min(h, w / 2.01);
  const height = Math.max(50, ref);
  return {
    padV:    Math.round(height * 0.082),
    padH:    Math.round(height * 0.096),
    title:   Math.round(height * 0.075),
    titleMB: Math.round(height * 0.055),
    day:     Math.round(height * 0.075),
    emoji:   Math.round(height * 0.135),
    emojiMT: Math.round(height * 0.027),
    emojiMB: Math.round(height * 0.027),
    tMax:    Math.round(height * 0.092),
    tMin:    Math.round(height * 0.085),
    tMinMB:  Math.round(height * 0.014),
    rain:    Math.round(height * 0.075),
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
      }}
    >
      <TextWidget
        text={label}
        style={{ color: colors.secondary, fontSize: sz.day, fontWeight: "600", letterSpacing: 0.4 }}
      />
      <TextWidget text={emoji} style={{ fontSize: sz.emoji, marginTop: sz.emojiMT, marginBottom: sz.emojiMB }} />
      <TextWidget
        text={fmt(day.tempMax, unit)}
        style={{ color: colors.primary, fontSize: sz.tMax, fontWeight: "700" }}
      />
      <TextWidget
        text={fmt(day.tempMin, unit)}
        style={{ color: colors.secondary, fontSize: sz.tMin, marginBottom: sz.tMinMB }}
      />
      <TextWidget
        text={rain}
        style={{ color: colors.rain, fontSize: sz.rain, fontWeight: "500" }}
      />
    </FlexWidget>
  );
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function ForecastWidget({ data, background, width = 294, height = 146 }: Props) {
  const c = getColors(background);
  const sz = sizes(width, height);

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
        }}
      >
        {days.map((day) => (
          <DayColumn key={day.date} day={day} unit={data.unit} colors={c} sz={sz} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
