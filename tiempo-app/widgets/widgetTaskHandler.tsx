import { registerWidgetTaskHandler } from "react-native-android-widget";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { WeatherWidget } from "./WeatherWidget";
import { loadWidgetData } from "./widgetStorage";

async function handler({ widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === "WIDGET_DELETED") return;

  const data = loadWidgetData();

  renderWidget({
    light: <WeatherWidget data={data} isDark={false} />,
    dark: <WeatherWidget data={data} isDark={true} />,
  });
}

// Registra el headless task al importar este módulo.
// Debe importarse antes de que Android pueda disparar el task.
registerWidgetTaskHandler(handler);
