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

function DayColumn({
  day,
  unit,
  colors,
  scale,
}: {
  day: WidgetDailyForecast;
  unit: "celsius" | "fahrenheit";
  colors: ReturnType<typeof getColors>;
  scale: number;
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
        style={{ color: colors.secondary, fontSize: s(10, scale), fontWeight: "600", letterSpacing: 0.4 }}
      />
      <TextWidget text={emoji} style={{ fontSize: s(18, scale), marginTop: s(4, scale), marginBottom: s(4, scale) }} />
      <TextWidget
        text={fmt(day.tempMax, unit)}
        style={{ color: colors.primary, fontSize: s(13, scale), fontWeight: "700" }}
      />
      <TextWidget
        text={fmt(day.tempMin, unit)}
        style={{ color: colors.secondary, fontSize: s(12, scale), marginBottom: s(2, scale) }}
      />
      <TextWidget
        text={rain}
        style={{ color: colors.rain, fontSize: s(11, scale), fontWeight: "500" }}
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

export function ForecastWidget({ data, background, width = BASE_W, height = BASE_H }: Props) {
  const c = getColors(background);
  const scale = getScale(width, height);
  const daysToShow = width >= 340 ? 7 : width >= 280 ? 6 : 5;

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
        paddingTop: s(12, scale),
        paddingBottom: s(12, scale),
        paddingLeft: s(14, scale),
        paddingRight: s(14, scale),
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={cityText}
        style={{
          color: c.secondary,
          fontSize: s(10, scale),
          fontWeight: "600",
          letterSpacing: 0.8,
          marginBottom: s(8, scale),
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
          <DayColumn key={day.date} day={day} unit={data.unit} colors={c} scale={scale} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
