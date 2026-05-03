import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Path, Line, Text as SvgText } from "react-native-svg";
import { ThemedCard, ThemedText, useThemeContext } from "@/components/theme";
import type { HourlyForecast } from "@/types/weather";

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
}

export function PrecipitationChart({ hourly }: PrecipitationChartProps) {
  const { isDark } = useThemeContext();

  const chartData = useMemo(() => {
    const points = hourly.slice(0, 24);
    if (points.length === 0) return null;

    const W = 340;
    const H = 160;
    const padL = 36;
    const padR = 12;
    const padT = 14;
    const padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const maxVal = 100;
    const minVal = 0;
    const range = maxVal - minVal;

    const getX = (i: number) => padL + (i / (points.length - 1)) * chartW;
    const getY = (val: number) => padT + chartH - ((val - minVal) / range) * chartH;

    let pathD = `M ${getX(0)} ${getY(points[0].precipitationChance)}`;
    for (let i = 1; i < points.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(points[i - 1].precipitationChance);
      const x1 = getX(i);
      const y1 = getY(points[i].precipitationChance);
      const cx = (x0 + x1) / 2;
      pathD += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }

    const fillD =
      pathD +
      ` L ${getX(points.length - 1)} ${padT + chartH}` +
      ` L ${getX(0)} ${padT + chartH} Z`;

    const gridValues = [0, 25, 50, 75, 100];
    const gridSteps = gridValues.map((val) => ({ val, y: getY(val) }));

    const hourTicks = [0, 6, 12, 18, 23];
    const hourLabels = hourTicks.map((h) => {
      const hour = parseInt(points[h]?.time?.split("T")[1]?.split(":")[0] ?? `${h}`, 10);
      return `${hour}h`;
    });

    const hasData = points.some((p) => p.precipitationChance > 0);

    return { W, H, padL, padR, padT, padB, chartW, chartH, pathD, fillD, gridSteps, hourTicks, hourLabels, hasData };
  }, [hourly]);

  if (!chartData || !chartData.hasData) return null;

  const lineColor = isDark ? "#5AC8FA" : "#007AFF";
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
        Probabilidad de lluvia
      </ThemedText>
      <View style={{ alignItems: "center" }}>
        <Svg width={chartData.W} height={chartData.H}>
          <Path d={chartData.fillD} fill={lineColor} opacity={Number(fillOpacity)} />
          <Path d={chartData.pathD} fill="none" stroke={lineColor} strokeWidth={2.5} />

          {chartData.gridSteps.map(({ val, y }, i) => (
            <React.Fragment key={i}>
              <Line
                x1={chartData.padL}
                y1={y}
                x2={chartData.W - chartData.padR}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
              />
              <SvgText
                x={chartData.padL - 6}
                y={y + 4}
                textAnchor="end"
                fill={labelColor}
                fontSize={12}
              >
                {val}
              </SvgText>
            </React.Fragment>
          ))}

          {chartData.hourTicks.map((h) => {
            const x = chartData.padL + (h / 23) * chartData.chartW;
            return (
              <React.Fragment key={h}>
                <Line
                  x1={x}
                  y1={chartData.padT}
                  x2={x}
                  y2={chartData.padT + chartData.chartH}
                  stroke={gridColor}
                  strokeWidth={1}
                />
                <SvgText
                  x={x}
                  y={chartData.padT + chartData.chartH + 18}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={12}
                >
                  {chartData.hourLabels[chartData.hourTicks.indexOf(h)]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </ThemedCard>
  );
}
