import type { WeatherCondition, WeatherData } from "@/types/weather";
import type { NotificationText } from "@/utils/alertFormat";

/**
 * Textos del resumen de la mañana y del aviso de lluvia próxima. Sin
 * dependencias de componentes: se usan desde la tarea en segundo plano.
 */

const SKY: Record<WeatherCondition, string> = {
  clear: "despejado",
  partly_cloudy: "intervalos de nubes",
  cloudy: "nublado",
  rain: "lluvia",
  storm: "tormentas",
  snow: "nieve",
  fog: "niebla",
  night_clear: "despejado",
  night_cloudy: "nublado",
};

const RAIN_MM = 0.2;

function hourOf(time: string): number {
  return parseInt(time.split("T")[1]?.split(":")[0] ?? "0", 10);
}

function temp(celsius: number, unit: "celsius" | "fahrenheit"): string {
  const v = unit === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(v)}°`;
}

// Open-Meteo da en cada hora T la lluvia acumulada entre T-1 y T.
// "lluvia hasta las 17 h", "lluvia desde las 15 h", "lluvia de 12 a 17 h".
function rainWindow(hours: { time: string; precipitation: number }[]): string | null {
  const wet = hours.map((h) => h.precipitation >= RAIN_MM);
  const first = wet.indexOf(true);
  if (first === -1) return null;
  const last = wet.lastIndexOf(true);
  const startHour = hourOf(hours[first].time) - 1;
  const endHour = hourOf(hours[last].time);
  if (first === 0 && last === hours.length - 1) return "lluvia todo el día";
  if (first === 0) return `lluvia hasta las ${endHour} h`;
  if (last === hours.length - 1) return `lluvia desde las ${startHour} h`;
  return `lluvia de ${startHour} a ${endHour} h`;
}

/**
 * Resumen del día `date` (YYYY-MM-DD). Las horas solo cubren las próximas 24,
 * así que el tramo de lluvia sale cuando ese día ya está dentro de la ventana.
 */
export function morningSummaryText(
  weather: WeatherData,
  date: string,
  unit: "celsius" | "fahrenheit"
): NotificationText | null {
  const day = weather.daily.find((d) => d.date === date);
  if (!day) return null;

  // Tramos de 08-09 en adelante (la hora 00 del día siguiente queda fuera).
  const hours = weather.hourly.filter((h) => h.time.startsWith(date) && hourOf(h.time) >= 9);
  const fullDay = hours.length >= 12;
  const window = fullDay ? rainWindow(hours) : null;
  const headline = window ?? SKY[day.condition];

  const parts = [`Entre ${temp(day.tempMin, unit)} y ${temp(day.tempMax, unit)}`];
  if (fullDay) {
    const mm = hours.reduce((acc, h) => acc + h.precipitation, 0);
    if (mm >= 1) parts.push(`${Math.round(mm)} mm de lluvia`);
    const gust = Math.max(0, ...hours.map((h) => h.windGusts));
    if (gust >= 50) parts.push(`Rachas de ${Math.round(gust)} km/h`);
  } else if (day.precipitationChance >= 30 && !window) {
    parts.push(`Probabilidad de lluvia del ${Math.round(day.precipitationChance)} %`);
  }

  return {
    title: `Hoy en ${weather.cityName}: ${headline}`,
    body: parts.map((p) => `${p}.`).join(" "),
  };
}

/**
 * Lluvia que empieza en la próxima hora. Los datos son horarios y la tarea
 * corre cada media hora como mucho: no se puede afinar a minutos.
 */
export function rainSoonText(weather: WeatherData): NotificationText | null {
  // hourly[0] es la hora en curso: su dato es la lluvia de la hora anterior.
  // hourly[1] cubre lo que queda de esta hora y hourly[2], la siguiente.
  const [past, thisHour, nextHour] = weather.hourly;
  if (!past || !thisHour) return null;
  const rainingNow =
    past.precipitation >= 0.1 || ["rain", "storm", "snow"].includes(weather.current.condition);
  if (rainingNow) return null;
  const soon = thisHour.precipitation >= 0.3 ? thisHour : nextHour && nextHour.precipitation >= 0.3 ? nextHour : null;
  if (!soon) return null;
  const to = hourOf(soon.time);
  const from = (to + 23) % 24;
  const mm = soon.precipitation < 1 ? "menos de 1" : `unos ${Math.round(soon.precipitation)}`;
  return {
    title: "Lluvia en la próxima hora",
    body: `${weather.cityName}. Se esperan ${mm} mm entre las ${from} y las ${to} h.`,
  };
}
