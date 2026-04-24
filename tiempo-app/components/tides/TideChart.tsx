import React from "react";
import { View } from "react-native";
import Svg, { Path, Line, Text as SvgText, Rect } from "react-native-svg";
import { ThemedCard, ThemedText, useThemeContext } from "@/components/theme";
import type { MarineData } from "@/types/weather";

interface TideChartProps {
  data: MarineData;
  dayIndex?: number;
}

export function TideChart({ data, dayIndex = 0 }: TideChartProps) {
  const { isDark } = useThemeContext();

  const dayStr = data.daily.date[dayIndex];
  if (!dayStr) return null;

  const dayStart = new Date(`${dayStr}T00:00`).getTime();
  const dayEnd = new Date(`${dayStr}T23:59`).getTime();

  const dayPoints: { time: number; height: number }[] = [];
  for (let i = 0; i < data.hourly.time.length; i++) {
    const t = new Date(data.hourly.time[i]).getTime();
    if (t >= dayStart && t <= dayEnd) {
      dayPoints.push({ time: t, height: data.hourly.waveHeight[i] });
    }
  }

  if (dayPoints.length === 0) return null;

  const W = 340;
  const H = 180;
  const padL = 36;
  const padR = 12;
  const padT = 20;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxH = Math.max(...dayPoints.map((p) => p.height), 0.5);
  const minH = 0;
  const range = maxH - minH || 1;

  const scaleX = (time: number) =>
    padL + ((time - dayStart) / (dayEnd - dayStart)) * chartW;
  const scaleY = (height: number) =>
    padT + chartH - ((height - minH) / range) * chartH;

  let pathD = `M ${scaleX(dayPoints[0].time)} ${scaleY(dayPoints[0].height)}`;
  for (let i = 1; i < dayPoints.length; i++) {
    const x0 = scaleX(dayPoints[i - 1].time);
    const y0 = scaleY(dayPoints[i - 1].height);
    const x1 = scaleX(dayPoints[i].time);
    const y1 = scaleY(dayPoints[i].height);
    const cx = (x0 + x1) / 2;
    pathD += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }

  const fillD =
    pathD +
    ` L ${scaleX(dayPoints[dayPoints.length - 1].time)} ${padT + chartH}` +
    ` L ${scaleX(dayPoints[0].time)} ${padT + chartH} Z`;

  const gridLines = 4;
  const gridSteps = Array.from({ length: gridLines + 1 }, (_, i) => {
    const val = minH + (range * i) / gridLines;
    return val;
  });

  const hours = [0, 6, 12, 18, 24];
  const hourLabels = ["00", "06", "12", "18", "24"];

  const strokeColor = isDark ? "#5AC8FA" : "#007AFF";
  const fillOpacity = isDark ? "0.15" : "0.12";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  return (
    <ThemedCard>
      <ThemedText
        secondary
        style={{
          fontSize: 13,
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: 12,
          letterSpacing: 0.5,
        }}
      >
        Altura de ola (24h)
      </ThemedText>
      <View style={{ alignItems: "center" }}>
        <Svg width={W} height={H}>
          <Path d={fillD} fill={strokeColor} opacity={Number(fillOpacity)} />
          <Path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} />

          {gridSteps.map((val, i) => {
            const y = scaleY(val);
            return (
              <React.Fragment key={i}>
                <Line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                />
                <SvgText
                  x={padL - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill={labelColor}
                  fontSize={10}
                >
                  {val.toFixed(1)}m
                </SvgText>
              </React.Fragment>
            );
          })}

          {hours.map((h, i) => {
            const x = padL + (h / 24) * chartW;
            return (
              <React.Fragment key={h}>
                <Line
                  x1={x}
                  y1={padT}
                  x2={x}
                  y2={padT + chartH}
                  stroke={gridColor}
                  strokeWidth={1}
                />
                <SvgText
                  x={x}
                  y={padT + chartH + 16}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={10}
                >
                  {hourLabels[i]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
          paddingHorizontal: padL,
        }}
      >
        <ThemedText secondary style={{ fontSize: 12 }}>
          Máx: {data.daily.waveHeightMax[dayIndex]?.toFixed(1) ?? "—"} m
        </ThemedText>
        <ThemedText secondary style={{ fontSize: 12 }}>
          Periodo: {data.daily.wavePeriodMax[dayIndex]?.toFixed(0) ?? "—"} s
        </ThemedText>
      </View>
    </ThemedCard>
  );
}
