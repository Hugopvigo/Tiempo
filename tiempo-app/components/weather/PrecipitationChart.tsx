import { useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { ThemedCard, CardTitle, useThemeContext } from "@/components/theme";
import { rainColor, secondaryTextColor, textColor, trackColor } from "@/constants/theme";
import type { HourlyForecast } from "@/types/weather";

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
}

const H = 132;
const PAD_TOP = 18; // sitio para la cifra del pico
const PAD_BOTTOM = 22; // etiquetas de hora
const MIN_SCALE_MM = 4; // una llovizna no debe dibujar barras hasta arriba
const MIN_TOTAL_MM = 0.1;

function formatMm(mm: number): string {
  return mm < 10 ? mm.toFixed(1).replace(".", ",").replace(",0", "") : String(Math.round(mm));
}

/**
 * Lluvia prevista hora a hora, en milímetros: una barra por hora, la cifra del
 * pico y el total del periodo. Sin lluvia no se muestra.
 */
export function PrecipitationChart({ hourly }: PrecipitationChartProps) {
  const { isDark } = useThemeContext();
  // Ancho real de la tarjeta, para que las 24 barras la llenen de borde a borde.
  const [width, setWidth] = useState(0);

  const points = useMemo(() => hourly.slice(0, 24), [hourly]);
  const total = useMemo(() => points.reduce((acc, p) => acc + p.precipitation, 0), [points]);

  const chart = useMemo(() => {
    if (points.length === 0 || width === 0) return null;
    const slot = width / points.length;
    const barW = Math.max(3, Math.min(10, slot - 4));
    const plotH = H - PAD_TOP - PAD_BOTTOM;
    const peak = Math.max(...points.map((p) => p.precipitation));
    const scale = Math.max(peak, MIN_SCALE_MM);
    const baseY = PAD_TOP + plotH;

    const bars = points.map((p, i) => {
      const h = p.precipitation > 0 ? Math.max(2, (p.precipitation / scale) * plotH) : 0;
      return { x: i * slot + (slot - barW) / 2, y: baseY - h, h, hour: parseInt(p.time.split("T")[1]?.slice(0, 2) ?? "0", 10) };
    });
    const peakIndex = points.findIndex((p) => p.precipitation === peak);
    return { slot, barW, baseY, bars, peak, peakIndex };
  }, [points, width]);

  if (total < MIN_TOTAL_MM) return null;

  const rain = isDark ? rainColor.dark : rainColor.light;
  const label = isDark ? secondaryTextColor.dark : secondaryTextColor.light;
  const strong = isDark ? textColor.dark : textColor.light;
  const base = isDark ? trackColor.dark : trackColor.light;

  return (
    <ThemedCard>
      <CardTitle aside={`${formatMm(total)} mm`} asideColor={rain}>
        Lluvia, próximas 24 horas
      </CardTitle>
      <View style={{ height: H }} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
        {chart && (
          <Svg width={width} height={H}>
            <Line x1={0} y1={chart.baseY} x2={width} y2={chart.baseY} stroke={base} strokeWidth={1} />
            {chart.bars.map((b, i) =>
              b.h > 0 ? (
                <Rect key={i} x={b.x} y={b.y} width={chart.barW} height={b.h} rx={Math.min(3, chart.barW / 2)} fill={rain} />
              ) : null
            )}
            {chart.peakIndex >= 0 && (
              <SvgText
                x={Math.min(Math.max(chart.bars[chart.peakIndex].x + chart.barW / 2, 22), width - 22)}
                y={chart.bars[chart.peakIndex].y - 5}
                textAnchor="middle"
                fill={rain}
                fontSize={11}
                fontWeight="600"
              >
                {`${formatMm(chart.peak)} mm`}
              </SvgText>
            )}
            {chart.bars.map((b, i) =>
              i % 3 === 0 ? (
                <SvgText
                  key={`h${i}`}
                  x={i === 0 ? 0 : b.x + chart.barW / 2}
                  y={H - 5}
                  textAnchor={i === 0 ? "start" : "middle"}
                  fill={i === 0 ? strong : label}
                  fontSize={11}
                  fontWeight={i === 0 ? "600" : "400"}
                >
                  {i === 0 ? "Ahora" : String(b.hour).padStart(2, "0")}
                </SvgText>
              ) : null
            )}
          </Svg>
        )}
      </View>
    </ThemedCard>
  );
}
