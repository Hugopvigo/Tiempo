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

/**
 * 2x2 widget — square aspect ratio (1:1).
 * ref = min(width, height) so content never overflows either axis.
 */
function sizes(w: number, h: number) {
  const ref = Math.max(80, Math.min(w, h));
  return {
    pad:     Math.round(ref * 0.096),
    city:    Math.round(ref * 0.075),
    emoji:   Math.round(ref * 0.178),
    temp:    Math.round(ref * 0.274),
    desc:    Math.round(ref * 0.082),
    maxMin:  Math.round(ref * 0.089),
    gap:     Math.round(ref * 0.041),
  };
}

interface Props {
  data: WidgetWeatherData | null;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function WeatherWidget({ data, background, width = 146, height = 146 }: Props) {
  const { bg, primary, secondary, accent } = getColors(background);
  const sz = sizes(width, height);

  if (!data) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          height: "match_parent",
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
          style={{ color: secondary, fontSize: sz.city, fontWeight: "500" }}
        />
        <TextWidget
          text="Sin datos"
          style={{ color: secondary, fontSize: sz.desc, marginTop: sz.gap }}
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
        width: "match_parent",
        height: "match_parent",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: bg,
        borderRadius: 20,
        overflow: "hidden",
        padding: sz.pad,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={cityText}
        style={{
          color: secondary,
          fontSize: sz.city,
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
          flexGap: sz.gap,
        }}
      >
        <TextWidget text={emoji} style={{ fontSize: sz.emoji }} />
        <TextWidget
          text={fmt(data.temperature, data.unit)}
          style={{ color: primary, fontSize: sz.temp, fontWeight: "700" }}
        />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "column" }}>
        <TextWidget
          text={data.description}
          style={{ color: secondary, fontSize: sz.desc, marginBottom: sz.gap }}
          maxLines={1}
          truncate="END"
        />
        <FlexWidget style={{ flexDirection: "row", flexGap: sz.gap }}>
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: sz.maxMin, fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: sz.maxMin }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
