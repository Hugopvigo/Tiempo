import { registerWidgetTaskHandler } from "react-native-android-widget";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { createMMKV } from "react-native-mmkv";
import { WeatherWidget } from "./WeatherWidget";
import { ClockWeatherWidget } from "./ClockWeatherWidget";
import { ForecastWidget } from "./ForecastWidget";
import { RainWidget } from "./RainWidget";
import { loadWidgetData, saveWidgetData } from "./widgetStorage";
import { getWeather } from "@/services/openmeteo";
import type { City, AppSettings } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });
const REFRESH_INTERVAL = 15 * 60 * 1000;

function currentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

async function fetchFreshData() {
  const cached = loadWidgetData();
  if (cached && Date.now() - cached.updatedAt < REFRESH_INTERVAL) return cached;

  try {
    const activeCityJson = storage.getString("activeCity");
    const settingsJson = storage.getString("settings");
    if (!activeCityJson) return cached;

    const city: City = JSON.parse(activeCityJson);
    const settings: AppSettings | null = settingsJson ? JSON.parse(settingsJson) : null;
    const unit = settings?.temperatureUnit ?? "celsius";

    const weather = await getWeather(city.lat, city.lon, city.name);
    const daily0 = weather.daily[0];

    const fresh = {
      cityName: weather.cityName,
      temperature: weather.current.temperature,
      tempMax: daily0?.tempMax ?? weather.current.temperature,
      tempMin: daily0?.tempMin ?? weather.current.temperature,
      condition: weather.current.condition,
      description: weather.current.description,
      unit,
      updatedAt: weather.updatedAt,
      forecast: weather.daily.slice(0, 7).map((d) => ({
        date: d.date,
        tempMax: d.tempMax,
        tempMin: d.tempMin,
        condition: d.condition,
        precipitationChance: d.precipitationChance,
      })),
    };

    saveWidgetData(fresh);
    return fresh;
  } catch {
    return cached;
  }
}

async function handler({ widgetAction, widgetInfo, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === "WIDGET_DELETED") return;

  const data = await fetchFreshData();
  const { widgetName, width, height } = widgetInfo;

  if (widgetName === "WeatherWidget") {
    renderWidget({
      light: <WeatherWidget data={data} background="light" width={width} height={height} />,
      dark: <WeatherWidget data={data} background="dark" width={width} height={height} />,
    });
  } else if (widgetName === "WeatherWidgetTransparent") {
    renderWidget(<WeatherWidget data={data} background="transparent" width={width} height={height} />);
  } else if (widgetName === "ClockWeatherWidget") {
    const time = currentTime();
    renderWidget({
      light: <ClockWeatherWidget data={data} time={time} background="light" width={width} height={height} />,
      dark: <ClockWeatherWidget data={data} time={time} background="dark" width={width} height={height} />,
    });
  } else if (widgetName === "ClockWeatherWidgetTransparent") {
    renderWidget(<ClockWeatherWidget data={data} time={currentTime()} background="transparent" width={width} height={height} />);
  } else if (widgetName === "ForecastWidget") {
    renderWidget({
      light: <ForecastWidget data={data} background="light" width={width} height={height} />,
      dark: <ForecastWidget data={data} background="dark" width={width} height={height} />,
    });
  } else if (widgetName === "ForecastWidgetTransparent") {
    renderWidget(<ForecastWidget data={data} background="transparent" width={width} height={height} />);
  } else if (widgetName === "RainWidget") {
    renderWidget({
      light: <RainWidget data={data} background="light" width={width} height={height} />,
      dark: <RainWidget data={data} background="dark" width={width} height={height} />,
    });
  } else if (widgetName === "RainWidgetTransparent") {
    renderWidget(<RainWidget data={data} background="transparent" width={width} height={height} />);
  }
}

registerWidgetTaskHandler(handler);
