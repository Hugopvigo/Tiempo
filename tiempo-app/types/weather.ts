export type WeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "night_clear"
  | "night_cloudy";

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
  condition: WeatherCondition;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  icon: string;
  precipitationChance: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  icon: string;
  precipitationChance: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  lat: number;
  lon: number;
  cityName: string;
  updatedAt: number;
}

export interface TideData {
  time: string;
  height: number;
  type: "high" | "low";
}

export interface TideForecast {
  date: string;
  tides: TideData[];
  coefficient?: number;
}

export interface MarineData {
  hourly: {
    time: string[];
    waveHeight: number[];
    waveDirection: number[];
    wavePeriod: number[];
    seaLevelHeight: number[];
  };
  daily: {
    date: string[];
    waveHeightMax: number[];
    waveDirectionDominant: number[];
    wavePeriodMax: number[];
  };
}

export type TideDirection = "rising" | "falling" | "stable";

export interface TideDirectionInfo {
  height: number;
  direction: TideDirection;
}

export interface SeaCondition {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  label: string;
  description: string;
}

export function getSeaConditionLabel(waveHeight: number): string {
  if (waveHeight < 0.5) return "Calma";
  if (waveHeight < 1.0) return "Marejadilla";
  if (waveHeight < 2.0) return "Marejada";
  if (waveHeight < 3.0) return "Mar gruesa";
  if (waveHeight < 5.0) return "Mar muy gruesa";
  return "Mar enorme";
}

export function getSeaConditionDescription(waveHeight: number): string {
  if (waveHeight < 0.5) return "Mar en calma, ideal para navegación";
  if (waveHeight < 1.0) return "Oleaje suave, condiciones favorables";
  if (waveHeight < 2.0) return "Oleaje moderado, precaución en embarcaciones pequeñas";
  if (waveHeight < 3.0) return "Oleaje fuerte, no recomendado para pequeñas embarcaciones";
  if (waveHeight < 5.0) return "Oleaje muy fuerte, permanecer en puerto";
  return "Condiciones extremas, peligro en la mar";
}

export interface City {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
  isLocation?: boolean;
  isCoastal?: boolean;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "yellow" | "orange" | "red";
  type: "rain" | "storm" | "snow" | "wind" | "heat" | "cold" | "coastal";
  startTime: string;
  endTime: string;
}

export type ThemeMode = "system" | "light" | "dark";
export type IconStyle = "colored" | "monochrome";

export interface AppSettings {
  theme: ThemeMode;
  iconStyle: IconStyle;
  notifications: {
    enabled: boolean;
    rain: boolean;
    storm: boolean;
    snow: boolean;
    wind: boolean;
    heat: boolean;
    cold: boolean;
    coastal: boolean;
  };
  temperatureUnit: "celsius" | "fahrenheit";
  windUnit: "kmh" | "mph" | "ms" | "knots";
  openWeatherMapApiKey?: string;
}
