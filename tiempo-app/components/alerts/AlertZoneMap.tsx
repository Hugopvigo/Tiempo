import { useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Polygon } from "react-native-svg";
import { trackColor, textColor } from "@/constants/theme";
import { useThemeContext } from "@/components/theme";

interface AlertZoneMapProps {
  /** Polígonos de la zona como pares [lat, lon] */
  polygons: [number, number][][];
  point?: { lat: number; lon: number };
  color: string;
}

const HEIGHT = 180;
const PAD = 14;

/**
 * Silueta de la zona del aviso con la ciudad marcada. No es un mapa: solo la
 * forma que envía AEMET, proyectada con la corrección de longitud por latitud.
 */
export function AlertZoneMap({ polygons, point, color }: AlertZoneMapProps) {
  const { isDark } = useThemeContext();
  const [width, setWidth] = useState(0);

  const shape = useMemo(() => {
    const all = polygons.flat();
    if (all.length < 3 || width === 0) return null;
    const pts = point ? [...all, [point.lat, point.lon] as [number, number]] : all;
    const lats = pts.map((p) => p[0]);
    const lons = pts.map((p) => p[1]);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    // Un grado de longitud mide menos que uno de latitud lejos del ecuador.
    const k = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180);
    const spanX = Math.max((lonMax - lonMin) * k, 1e-6);
    const spanY = Math.max(latMax - latMin, 1e-6);
    const scale = Math.min((width - 2 * PAD) / spanX, (HEIGHT - 2 * PAD) / spanY);
    const offX = (width - spanX * scale) / 2;
    const offY = (HEIGHT - spanY * scale) / 2;
    const project = ([lat, lon]: [number, number]) => ({
      x: offX + (lon - lonMin) * k * scale,
      y: offY + (latMax - lat) * scale,
    });
    return {
      rings: polygons.map((ring) => ring.map(project).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")),
      dot: point ? project([point.lat, point.lon]) : null,
    };
  }, [polygons, point, width]);

  const ink = isDark ? textColor.dark : textColor.light;

  return (
    <View
      style={{ height: HEIGHT, borderRadius: 12, overflow: "hidden", backgroundColor: isDark ? trackColor.dark : trackColor.light }}
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      accessible
      accessibilityRole="image"
      accessibilityLabel={point ? "Silueta de la zona del aviso con tu ciudad marcada" : "Silueta de la zona del aviso"}
    >
      {shape && (
        <Svg width={width} height={HEIGHT}>
          {shape.rings.map((points, i) => (
            <Polygon key={i} points={points} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={2} strokeLinejoin="round" />
          ))}
          {shape.dot && (
            <Circle cx={shape.dot.x} cy={shape.dot.y} r={6} fill={ink} stroke={isDark ? "#0F172A" : "#FFFFFF"} strokeWidth={2.5} />
          )}
        </Svg>
      )}
    </View>
  );
}
