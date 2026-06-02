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

/**
 * Sizes derived from the actual height, but capped by the widget's
 * natural aspect ratio (4:1 = 270:72 ≈ 3.75) so fonts never outgrow
 * the horizontal space even when the user enlarges the widget.
 */
function sizes(w: number, h: number) {
  // "ref" height: actual height but never more than what a 4:1 ratio allows
  const ref = Math.max(40, Math.min(h, w / 3.75));
  return {
    padV:   Math.round(ref * 0.11),
    padH:   Math.round(ref * 0.19),
    city:   Math.round(ref * 0.13),
    time:   Math.round(ref * 0.38),
    emoji:  Math.round(ref * 0.27),
    temp:   Math.round(ref * 0.38),
    detail: Math.round(ref * 0.14),
    gap:    Math.round(ref * 0.05),
  };
}

interface Props {
  data: WidgetWeatherData | null;
  time: string;
  background: WidgetBackground;
  width?: number;
  height?: number;
}

export function ClockWeatherWidget({ data, time, background, width = 270, height = 72 }: Props) {
  const { bg, primary, secondary, accent } = getColors(background);
  const sz = sizes(width, height);

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
        <TextWidget text="Tiempo" style={{ color: secondary, fontSize: sz.city, fontWeight: "500" }} />
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
        paddingTop: sz.padV,
        paddingBottom: sz.padV,
        paddingLeft: sz.padH,
        paddingRight: sz.padH,
      }}
      clickAction="OPEN_APP"
    >
      {/* Left: city name + time */}
      <FlexWidget style={{ flexDirection: "column", justifyContent: "center" }}>
        <TextWidget
          text={cityText}
          style={{ color: secondary, fontSize: sz.city, fontWeight: "600", letterSpacing: 0.8 }}
          maxLines={1}
          truncate="END"
        />
        <TextWidget
          text={time}
          style={{ color: primary, fontSize: sz.time, fontWeight: "700", marginTop: sz.gap }}
        />
      </FlexWidget>

      {/* Right: emoji + temp + max/min */}
      <FlexWidget style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
        <FlexWidget style={{ flexDirection: "row", alignItems: "center", flexGap: sz.gap }}>
          <TextWidget text={emoji} style={{ fontSize: sz.emoji }} />
          <TextWidget
            text={fmt(data.temperature, data.unit)}
            style={{ color: primary, fontSize: sz.temp, fontWeight: "700" }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: "row", flexGap: sz.gap * 2, marginTop: sz.gap }}>
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: sz.detail, fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: sz.detail }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
