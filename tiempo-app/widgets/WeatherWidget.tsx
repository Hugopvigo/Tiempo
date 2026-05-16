import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData } from "./widgetStorage";

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

interface Props {
  data: WidgetWeatherData | null;
  isDark: boolean;
}

export function WeatherWidget({ data, isDark }: Props) {
  const bg = isDark ? "#0F172A" : "#FFFFFF";
  const primary = isDark ? "#F1F5F9" : "#0F172A";
  const secondary = isDark ? "#94A3B8" : "#64748B";
  const accent = isDark ? "#38BDF8" : "#0EA5E9";

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
      >
        <TextWidget
          text="Tiempo"
          style={{ color: secondary, fontSize: 14, fontWeight: "500" }}
        />
        <TextWidget
          text="Sin datos"
          style={{ color: secondary, fontSize: 12, marginTop: 4 }}
        />
      </FlexWidget>
    );
  }

  const emoji = CONDITION_EMOJI[data.condition] ?? "🌡️";

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: bg,
        borderRadius: 20,
        overflow: "hidden",
        padding: 16,
      }}
    >
      {/* City name */}
      <TextWidget
        text={data.cityName.toUpperCase()}
        style={{
          color: secondary,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.8,
        }}
        maxLines={1}
        truncate="END"
      />

      {/* Temperature + emoji row */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexGap: 8,
        }}
      >
        <TextWidget
          text={emoji}
          style={{ fontSize: 28 }}
        />
        <TextWidget
          text={fmt(data.temperature, data.unit)}
          style={{
            color: primary,
            fontSize: 42,
            fontWeight: "700",
          }}
        />
      </FlexWidget>

      {/* Description + max/min */}
      <FlexWidget
        style={{
          flexDirection: "column",
        }}
      >
        <TextWidget
          text={data.description}
          style={{ color: secondary, fontSize: 12, marginBottom: 4 }}
          maxLines={1}
          truncate="END"
        />
        <FlexWidget
          style={{
            flexDirection: "row",
            flexGap: 10,
          }}
        >
          <TextWidget
            text={`↑ ${fmt(data.tempMax, data.unit)}`}
            style={{ color: accent, fontSize: 13, fontWeight: "600" }}
          />
          <TextWidget
            text={`↓ ${fmt(data.tempMin, data.unit)}`}
            style={{ color: secondary, fontSize: 13 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
