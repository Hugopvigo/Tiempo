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
 * The library renders the whole widget to a bitmap of the reported
 * height x width (scaleType=matrix, drawn 1:1 top-left). So the reported
 * HEIGHT is a reliable canvas dimension; we size everything from it.
 * A high cap prevents fonts exploding if the widget is made very tall;
 * width never shrinks fonts (columns fill width via match_parent + flex).
 */
function sizes(w: number, h: number) {
  const ref = Math.max(70, Math.min(h, 210));
  return {
    padV:    Math.round(ref * 0.075),
    padH:    Math.round(ref * 0.06),
    title:   Math.round(ref * 0.085),
    titleMB: Math.round(ref * 0.04),
    day:     Math.round(ref * 0.085),
    emoji:   Math.round(ref * 0.16),
    emojiMT: Math.round(ref * 0.02),
    emojiMB: Math.round(ref * 0.02),
    tMax:    Math.round(ref * 0.11),
    tMin:    Math.round(ref * 0.10),
    tMinMB:  Math.round(ref * 0.012),
    rain:    Math.round(ref * 0.085),
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
