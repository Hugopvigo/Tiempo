import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData, WidgetDailyForecast } from "./widgetStorage";
import type { WidgetBackground } from "./WeatherWidget";

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

function getColors(background: WidgetBackground) {
  if (background === "transparent") return {
    bg: "rgba(0, 0, 0, 0)",
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.65)",
    accent: "#93C5FD",
    rain: "#7DD3FC",
  } as const;
  if (background === "dark") return {
    bg: "#0F172A",
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    accent: "#38BDF8",
    rain: "#38BDF8",
  } as const;
  return {
    bg: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#0EA5E9",
    rain: "#0EA5E9",
  } as const;
}

function DayColumn({
  day,
  unit,
  colors,
}: {
  day: WidgetDailyForecast;
  unit: "celsius" | "fahrenheit";
  colors: ReturnType<typeof getColors>;
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
        style={{ color: colors.secondary, fontSize: 10, fontWeight: "600", letterSpacing: 0.4 }}
      />
      <TextWidget text={emoji} style={{ fontSize: 18, marginTop: 4, marginBottom: 4 }} />
      <TextWidget
        text={fmt(day.tempMax, unit)}
        style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}
      />
      <TextWidget
        text={fmt(day.tempMin, unit)}
        style={{ color: colors.secondary, fontSize: 12, marginBottom: 2 }}
      />
      <TextWidget
        text={rain}
        style={{ color: colors.rain, fontSize: 11, fontWeight: "500" }}
      />
    </FlexWidget>
  );
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
}

export function ForecastWidget({ data, background }: Props) {
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

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: c.bg,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 14,
        paddingRight: 14,
      }}
    >
      <TextWidget
        text={data.cityName.toUpperCase()}
        style={{
          color: c.secondary,
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.8,
          marginBottom: 8,
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
          <DayColumn key={day.date} day={day} unit={data.unit} colors={c} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
