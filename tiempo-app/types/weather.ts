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

export interface City {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
  isLocation?: boolean;
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

export interface AppSettings {
  theme: ThemeMode;
  notifications: {
    enabled: boolean;
    rain: boolean;
    storm: boolean;
    snow: boolean;
    wind: boolean;
  };
  temperatureUnit: "celsius" | "fahrenheit";
  windUnit: "kmh" | "mph" | "ms" | "knots";
}
