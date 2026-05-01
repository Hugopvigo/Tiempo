import type { WeatherAlert } from "@/types/weather";

const BASE_URL = "https://opendata.aemet.es/opendata";

interface AEMETConfig {
  apiKey: string;
}

let config: AEMETConfig = { apiKey: "" };

export function configureAEMET(apiKey: string) {
  config = { apiKey };
}

async function aemetFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      api_key: config.apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`AEMET error: ${res.status}`);

  const data = await res.json();
  if (data.datos) {
    const dataRes = await fetch(data.datos);
    if (!dataRes.ok) throw new Error(`AEMET data error: ${dataRes.status}`);
    return dataRes.json();
  }

  return data;
}

interface AEMETAlertRaw {
  tipo: string;
  severity: string;
  title: string;
  description: string;
  onset: string;
  expires: string;
  area?: string;
}

function parseAEMETSeverity(severity: string): WeatherAlert["severity"] {
  const lower = severity.toLowerCase();
  if (lower.includes("rojo") || lower.includes("red")) return "red";
  if (lower.includes("naranja") || lower.includes("orange")) return "orange";
  return "yellow";
}

function parseAEMETType(tipo: string): WeatherAlert["type"] | null {
  const lower = tipo.toLowerCase();
  if (lower.includes("lluvia") || lower.includes("precipitación")) return "rain";
  if (lower.includes("tormenta") || lower.includes("rayos")) return "storm";
  if (lower.includes("nieve")) return "snow";
  if (lower.includes("viento")) return "wind";
  if (lower.includes("calor") || lower.includes("temperatura máxima")) return "heat";
  if (lower.includes("frío") || lower.includes("temperatura mínima")) return "cold";
  if (lower.includes("costera") || lower.includes("marítimo")) return "coastal";
  if (lower.includes("niebla")) return "fog";
  if (lower.includes("polvo") || lower.includes("arena") || lower.includes("calima")) return "fog";
  if (lower.includes("deshielo") || lower.includes("hielo")) return "cold";
  return null;
}

export async function getAEMETAlerts(zonaCode: string): Promise<WeatherAlert[]> {
  try {
    const raw = await aemetFetch<AEMETAlertRaw[]>(
      `/api/avisos_cap/${zonaCode}`
    );
    if (!Array.isArray(raw)) return [];

    return raw
      .map((alert) => {
        const type = parseAEMETType(alert.tipo ?? "");
        if (!type) return null;
        const severity = parseAEMETSeverity(alert.severity);
        const onset = alert.onset ?? new Date().toISOString();
        return {
          id: `aemet-${zonaCode}-${type}-${severity}-${onset.slice(0, 10)}`,
          title: alert.title ?? alert.tipo ?? "Aviso AEMET",
          description: alert.description ?? "",
          severity,
          type,
          startTime: onset,
          endTime: alert.expires ?? new Date(Date.now() + 24 * 3600000).toISOString(),
        } as WeatherAlert;
      })
      .filter((a): a is WeatherAlert => a !== null);
  } catch {
    return [];
  }
}

export async function getAEMETForecast(municipioCode: string) {
  return aemetFetch<any>(`/api/prediccion/especifica/municipio/diaria/${municipioCode}`);
}

export async function getAEMETTides(puertoCode: string) {
  return aemetFetch<any>(`/api/prediccion/maritiva/puerto/${puertoCode}`);
}

export function isAEMETConfigured(): boolean {
  return config.apiKey !== "";
}
