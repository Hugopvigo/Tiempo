import { requireNativeModule } from "expo-modules-core";

const TiempoWidgetModule = requireNativeModule("TiempoWidgetModule");

export async function updateWidgetData(data: {
  cityName: string;
  temp: string;
  condition: string;
  highLow: string;
  forecast: { name: string; temp: string }[];
}): Promise<void> {
  return await TiempoWidgetModule.updateWidgetData(JSON.stringify(data));
}

export function requestWidgetUpdate(): void {
  TiempoWidgetModule.requestWidgetUpdate();
}
