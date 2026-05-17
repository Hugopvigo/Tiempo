export type WidgetBackground = "dark" | "light" | "transparent";

// Mirror the library's ColorProp so we avoid importing from internal paths
type HexColor = `#${string}`;
type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type ColorProp = HexColor | RgbaColor;

export interface WidgetColors {
  bg: ColorProp;
  primary: ColorProp;
  secondary: ColorProp;
  accent: ColorProp;
  rain: ColorProp;
  line: ColorProp;
  dot: ColorProp;
}

export function getColors(background: WidgetBackground): WidgetColors {
  if (background === "transparent") return {
    bg: "rgba(0, 0, 0, 0)",
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.65)",
    accent: "#93C5FD",
    rain: "#7DD3FC",
    line: "#93C5FD",
    dot: "#DBEAFE",
  };
  if (background === "dark") return {
    bg: "#0F172A",
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    accent: "#38BDF8",
    rain: "#38BDF8",
    line: "#38BDF8",
    dot: "#0EA5E9",
  };
  return {
    bg: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#0EA5E9",
    rain: "#0EA5E9",
    line: "#3B82F6",
    dot: "#2563EB",
  };
}

/** Returns a stale suffix like "  ·  hace 3h" when data is older than 1h, else "". */
export function staleLabel(updatedAt: number): string {
  const diffH = Math.floor((Date.now() - updatedAt) / 3_600_000);
  if (diffH < 1) return "";
  return `  ·  hace ${diffH}h`;
}
