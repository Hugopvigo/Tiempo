import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData } from "./widgetStorage";
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

function getColors(background: WidgetBackground) {
  if (background === "transparent") return {
    bg: "rgba(0, 0, 0, 0)",
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.65)",
    accent: "#93C5FD",
  } as const;
  if (background === "dark") return {
    bg: "#0F172A",
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    accent: "#38BDF8",
  } as const;
  return {
    bg: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#0EA5E9",
  } as const;
}

interface Props {
  data: WidgetWeatherData | null;
  time: string;
  background: WidgetBackground;
}

export function ClockWeatherWidget({ data, time, background }: Props) {
  const { bg, primary, secondary, accent } = getColors(background);

  if (!data) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <TextWidget text="Tiempo" style={{ color: secondary, fontSize: 14, fontWeight: "500" }} />
      </FlexWidget>
    );
  }

  const emoji = CONDITION_EMOJI[data.condition] ?? "🌡️";

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: bg,
        borderRadius: 20,
        overflow: "hidden",
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {/* Left: city name + time */}
      <FlexWidget style={{ flexDirection: "column", justifyContent: "center" }}>
        <TextWidget
          text={data.cityName.toUpperCase()}
          style={{ color: secondary, fontSize: 10, fontWeight: "600", letterSpacing: 0.8 }}
          maxLines={1}
          truncate="END"
        />
        <TextWidget
          text={time}
          style={{ color: primary, fontSize: 34, fontWeight: "700", marginTop: 2 }}
        />
      </FlexWidget>

      {/* Right: emoji + temp + max/min */}
      <FlexWidget style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
        <FlexWidget style={{ flexDirection: "row", alignItems: "center", flexGap: 6 }}>
          <TextWidget text={emoji} style={{ fontSize: 22 }} />
          <TextWidget
            text={fmt(data.temperature, data.unit)}
            style={{ color: primary, fontSize: 34, fontWeight: "700" }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: "row", flexGap: 10, marginTop: 2 }}>
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: 12, fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: 12 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
