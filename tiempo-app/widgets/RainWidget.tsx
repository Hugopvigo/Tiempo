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
 * The library renders to a bitmap of the reported height x width
 * (scaleType=matrix, drawn 1:1). So the reported HEIGHT is a reliable
 * canvas dimension. We compute the bar track height in explicit dp from
 * it and give each bar an explicit dp height = track * pct/100. This is
 * fully deterministic — no fragile flex-weight games, no SVG letterboxing.
 */
function sizes(w: number, h: number) {
  const ref = Math.max(70, Math.min(h, 210));
  const padV = Math.round(ref * 0.075);
  const title = Math.round(ref * 0.085);
  const pct = Math.round(ref * 0.075);
  const day = Math.round(ref * 0.08);
  const gap = Math.round(ref * 0.03);
  // Vertical budget left for the bar track after title, %label, day label, paddings
  const lineH = (f: number) => Math.round(f * 1.3);
  const track = Math.max(
    20,
    ref - padV * 2 - lineH(title) - lineH(pct) - lineH(day) - gap * 3,
  );
  return { ref, padV, padH: Math.round(ref * 0.06), title, pct, day, gap, track };
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
  // Explicit dp height for the bar (min nub so 0% still shows a baseline)
  const barH = Math.max(3, Math.round((sz.track * pct) / 100));

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <TextWidget
        text={`${pct}%`}
        style={{
          color: pct > 0 ? colors.primary : colors.secondary,
          fontSize: sz.pct,
          fontWeight: "700",
          marginBottom: sz.gap,
        }}
        maxLines={1}
      />

      {/* Fixed-height track; bar sits at the bottom */}
      <FlexWidget
        style={{
          height: sz.track,
          width: "match_parent",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <FlexWidget
          style={{
            height: barH,
            width: "55%",
            backgroundColor: colors.line,
            borderRadius: 6,
          }}
        />
      </FlexWidget>

      <TextWidget
        text={label}
        style={{
          color: colors.secondary,
          fontSize: sz.day,
          fontWeight: "600",
          marginTop: sz.gap,
        }}
        maxLines={1}
        truncate="END"
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

      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
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
