import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetWeatherData, WidgetDailyForecast } from "./widgetStorage";
import { getColors, staleLabel } from "./widgetTheme";
import type { WidgetBackground } from "./widgetTheme";

const DAYS_TO_SHOW = 5;

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
 * Font/spacing sizes derived from a ratio-capped reference dimension.
 * Layout itself is 100% flex-weight based (no pixel positioning), so the
 * chart always fills the real widget slot regardless of how Android
 * reports width/height.
 */
function sizes(w: number, h: number) {
  const ref = Math.max(50, Math.min(h, w / 2.01));
  return {
    padV:  Math.round(ref * 0.082),
    padH:  Math.round(ref * 0.096),
    title: Math.round(ref * 0.078),
    pct:   Math.round(ref * 0.072),
    day:   Math.round(ref * 0.072),
    gap:   Math.round(ref * 0.04),
  };
}

function DayBar({
  day,
  colors,
  sz,
}: {
  day: WidgetDailyForecast;
  colors: ReturnType<typeof getColors>;
  sz: ReturnType<typeof sizes>;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(day.precipitationChance)));
  const label = getDayLabel(day.date);

  // Integer weights (native reads weight as int). Bar grows from the bottom;
  // a minimum weight keeps a thin visible nub even at 0%.
  const barWeight = Math.max(3, pct);
  const spacerWeight = Math.max(1, 100 - pct);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        height: "match_parent",
      }}
    >
      {/* % label */}
      <TextWidget
        text={`${pct}%`}
        style={{
          color: pct > 0 ? colors.primary : colors.secondary,
          fontSize: sz.pct,
          fontWeight: "700",
          marginBottom: sz.gap,
        }}
      />

      {/* Bar track (fills remaining vertical space) */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        {/* empty top spacer */}
        <FlexWidget style={{ flex: spacerWeight, width: "match_parent" }} />
        {/* the colored bar */}
        <FlexWidget
          style={{
            flex: barWeight,
            width: "60%",
            backgroundColor: colors.line,
            borderRadius: 6,
          }}
        />
      </FlexWidget>

      {/* day label */}
      <TextWidget
        text={label}
        style={{
          color: colors.secondary,
          fontSize: sz.day,
          fontWeight: "600",
          marginTop: sz.gap,
          letterSpacing: 0.3,
        }}
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

export function RainWidget({ data, background, width = 294, height = 146 }: Props) {
  const c = getColors(background);
  const sz = sizes(width, height);

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

  const days = data.forecast.slice(0, DAYS_TO_SHOW);
  const titleText = data.cityName.toUpperCase() + " · LLUVIA" + staleLabel(data.updatedAt);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
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
        text={titleText}
        style={{
          color: c.secondary,
          fontSize: sz.title,
          fontWeight: "600",
          letterSpacing: 0.8,
          marginBottom: sz.gap,
        }}
        maxLines={1}
        truncate="END"
      />

      {/* Bars row fills all remaining space */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          width: "match_parent",
        }}
      >
        {days.map((day) => (
          <DayBar key={day.date} day={day} colors={c} sz={sz} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
