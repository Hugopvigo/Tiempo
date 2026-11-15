import type { WeatherAlert } from "@/types/weather";

/**
 * Formato de los avisos, sin dependencias de componentes: lo usan también las
 * notificaciones en segundo plano, que no deben cargar iconos de Lucide.
 */

export function severityLabel(s: WeatherAlert["severity"]): string {
  switch (s) {
    case "red": return "Rojo";
    case "orange": return "Naranja";
    case "yellow": return "Amarillo";
  }
}

function whenLabel(d: Date, now: Date): string {
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return `las ${time}`;
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `mañana a las ${time}`;
  return `el ${d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}, ${time}`;
}

// "Hasta las 11:00", "Hasta mañana a las 09:00" o, si aún no ha empezado,
// "Desde mañana a las 09:00 hasta el lun 3, 12:00".
export function validityLabel(startIso: string, endIso: string, now: Date = new Date()): string {
  const end = new Date(endIso);
  if (isNaN(end.getTime())) return "";
  const start = new Date(startIso);
  const until = `hasta ${whenLabel(end, now)}`;
  if (!isNaN(start.getTime()) && start.getTime() > now.getTime() + 60 * 60 * 1000) {
    return `Desde ${whenLabel(start, now)} ${until}`;
  }
  return until.charAt(0).toUpperCase() + until.slice(1);
}

const PHENOMENON: Record<WeatherAlert["type"], string> = {
  rain: "lluvias",
  storm: "tormentas",
  snow: "nevadas",
  wind: "viento",
  heat: "calor",
  cold: "frío",
  coastal: "fenómenos costeros",
  fog: "niebla",
};

export function phenomenonLabel(type: WeatherAlert["type"]): string {
  return PHENOMENON[type];
}

function timeLabel(d: Date): string {
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// "Hoy de 12:00 a 18:00", "Mañana de 06:00 a 12:00"; si ya ha empezado o cruza
// de día, lo mismo que validityLabel ("Hasta las 18:00", "Desde … hasta …").
export function periodLabel(startIso: string, endIso: string, now: Date = new Date()): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return validityLabel(startIso, endIso, now);
  if (start.getTime() > now.getTime() && start.toDateString() === end.toDateString()) {
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const day =
      start.toDateString() === now.toDateString() ? "Hoy"
      : start.toDateString() === tomorrow.toDateString() ? "Mañana"
      : null;
    if (day) return `${day} de ${timeLabel(start)} a ${timeLabel(end)}`;
  }
  return validityLabel(startIso, endIso, now);
}

export interface NotificationText {
  title: string;
  body: string;
}

function sentence(...parts: (string | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .map((p) => (/[.!?]$/.test(p) ? p : `${p}.`))
    .join(" ");
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Aviso nuevo. El oficial dice nivel, fenómeno y zona en el título; el propio
 * se presenta como previsión, no como aviso, para no confundirse con AEMET.
 */
export function newAlertText(alert: WeatherAlert, now: Date = new Date()): NotificationText {
  const period = periodLabel(alert.startTime, alert.endTime, now);
  if (alert.source === "aemet") {
    const where = alert.zone ? ` en ${alert.zone}` : "";
    return {
      title: `Aviso ${severityLabel(alert.severity).toLowerCase()}: ${PHENOMENON[alert.type]}${where}`,
      body: sentence(period, alert.detail),
    };
  }
  const where = alert.zone ? ` en ${alert.zone}` : "";
  return {
    title: `Previsión: ${lowerFirst(alert.title)}${where}`,
    body: sentence(alert.detail ?? alert.description, "Sin aviso oficial de AEMET"),
  };
}

export function upgradedAlertText(alert: WeatherAlert, now: Date = new Date()): NotificationText {
  const period = lowerFirst(periodLabel(alert.startTime, alert.endTime, now));
  return {
    title: `El aviso de ${PHENOMENON[alert.type]} sube a ${severityLabel(alert.severity).toLowerCase()}`,
    body: sentence([alert.zone, period].filter(Boolean).join(", "), alert.detail),
  };
}

export function endedAlertText(type: WeatherAlert["type"], zone?: string): NotificationText {
  return {
    title: `Termina el aviso de ${PHENOMENON[type]}`,
    body: sentence(zone ?? "Ya no hay aviso en tu zona"),
  };
}

/** Ruta del detalle con el aviso en los parámetros; la usan el banner y las notificaciones. */
export function alertDetailUrl(alert: WeatherAlert): string {
  const params = new URLSearchParams({
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    type: alert.type,
    startTime: alert.startTime,
    endTime: alert.endTime,
    source: alert.source ?? "local",
  });
  if (alert.zone) params.set("zone", alert.zone);
  if (alert.detail) params.set("detail", alert.detail);
  if (alert.polygons) params.set("polygons", JSON.stringify(alert.polygons));
  return `/alert-detail?${params.toString()}`;
}
