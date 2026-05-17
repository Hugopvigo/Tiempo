import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData } from "./widgetStorage";
import { getColors, staleLabel } from "./widgetTheme";
import type { WidgetBackground } from "./widgetTheme";

// Re-export so other widgets that already import WidgetBackground from here keep working
export type { WidgetBackground } from "./widgetTheme";

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

// Base design dimensions (2x2 target: ~146x146dp)
const BASE_W = 146;
const BASE_H = 146;

function getScale(width: number, height: number): number {
  if (!width || !height) return 1;
  return Math.max(0.7, Math.min(2.5, Math.min(width / BASE_W, height / BASE_H)));
}

function s(value: number, scale: number): number {
  return Math.round(value * scale);
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function WeatherWidget({ data, background, width = BASE_W, height = BASE_H }: Props) {
  const { bg, primary, secondary, accent } = getColors(background);
  const scale = getScale(width, height);

  if (!data) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: 20,
          overflow: "hidden",
        }}
        clickAction="OPEN_APP"
      >
        <TextWidget
          text="Tiempo"
          style={{ color: secondary, fontSize: s(14, scale), fontWeight: "500" }}
        />
        <TextWidget
          text="Sin datos"
          style={{ color: secondary, fontSize: s(12, scale), marginTop: s(4, scale) }}
        />
      </FlexWidget>
    );
  }

  const emoji = CONDITION_EMOJI[data.condition] ?? "🌡️";
  const cityText = data.cityName.toUpperCase() + staleLabel(data.updatedAt);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: bg,
        borderRadius: 20,
        overflow: "hidden",
        padding: s(14, scale),
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={cityText}
        style={{
          color: secondary,
          fontSize: s(11, scale),
          fontWeight: "600",
          letterSpacing: 0.8,
        }}
        maxLines={1}
        truncate="END"
      />

      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexGap: s(6, scale),
        }}
      >
        <TextWidget text={emoji} style={{ fontSize: s(26, scale) }} />
        <TextWidget
          text={fmt(data.temperature, data.unit)}
          style={{ color: primary, fontSize: s(40, scale), fontWeight: "700" }}
        />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "column" }}>
        <TextWidget
          text={data.description}
          style={{ color: secondary, fontSize: s(12, scale), marginBottom: s(3, scale) }}
          maxLines={1}
          truncate="END"
        />
        <FlexWidget style={{ flexDirection: "row", flexGap: s(10, scale) }}>
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: s(13, scale), fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: s(13, scale) }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
