import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData } from "./widgetStorage";
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

// Base design dimensions (4x1 target: ~294x72dp)
const BASE_W = 294;
const BASE_H = 72;

function getScale(width: number, height: number): number {
  if (!height) return 1;
  return Math.max(0.7, Math.min(2.5, height / BASE_H));
}

function s(value: number, scale: number): number {
  return Math.round(value * scale);
}

interface Props {
  data: WidgetWeatherData | null;
  time: string;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function ClockWeatherWidget({ data, time, background, width = BASE_W, height = BASE_H }: Props) {
  const { bg, primary, secondary, accent } = getColors(background);
  const scale = getScale(width, height);

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
      clickAction="OPEN_APP"
    >
      <TextWidget text="Tiempo" style={{ color: secondary, fontSize: s(14, scale), fontWeight: "500" }} />
      </FlexWidget>
    );
  }

  const emoji = CONDITION_EMOJI[data.condition] ?? "🌡️";
  const cityText = data.cityName.toUpperCase() + staleLabel(data.updatedAt);

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
        paddingTop: s(10, scale),
        paddingBottom: s(10, scale),
        paddingLeft: s(16, scale),
        paddingRight: s(16, scale),
      }}
      clickAction="OPEN_APP"
    >
      {/* Left: city name + time */}
      <FlexWidget style={{ flexDirection: "column", justifyContent: "center" }}>
        <TextWidget
          text={cityText}
          style={{ color: secondary, fontSize: s(10, scale), fontWeight: "600", letterSpacing: 0.8 }}
          maxLines={1}
          truncate="END"
        />
        <TextWidget
          text={time}
          style={{ color: primary, fontSize: s(34, scale), fontWeight: "700", marginTop: s(2, scale) }}
        />
      </FlexWidget>

      {/* Right: emoji + temp + max/min */}
      <FlexWidget style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
        <FlexWidget style={{ flexDirection: "row", alignItems: "center", flexGap: s(6, scale) }}>
          <TextWidget text={emoji} style={{ fontSize: s(22, scale) }} />
          <TextWidget
            text={fmt(data.temperature, data.unit)}
            style={{ color: primary, fontSize: s(34, scale), fontWeight: "700" }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: "row", flexGap: s(10, scale), marginTop: s(2, scale) }}>
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: s(12, scale), fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: s(12, scale) }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
