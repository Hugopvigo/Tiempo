import type { WeatherAlert } from "@/types/weather";
import { getCCAACode } from "@/constants/aemetZones";
import { XMLParser } from "fast-xml-parser";

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

const CAP_SEVERITY: Record<string, WeatherAlert["severity"] | null> = {
  Extreme: "red",
  Severe: "orange",
  Moderate: "yellow",
  Minor: null,
};

// Fenómenos del Plan Meteoalerta (eventos CAP en español, p. ej. "Aviso de
// temperaturas máximas de nivel rojo"). Se compara sin acentos porque el XML
// llega en UTF-8 y así da igual cómo venga escrito.
export function capEventToType(event: string): WeatherAlert["type"] | null {
  const e = stripAccents(event);
  if (/lluvia|precipitaci/.test(e)) return "rain";
  if (/tormenta|rayos|electric/.test(e)) return "storm";
  if (/nieve|nevada|alud/.test(e)) return "snow";
  if (/viento|racha/.test(e)) return "wind";
  if (/calor|temperaturas? max/.test(e)) return "heat";
  if (/frio|temperaturas? min|hielo|deshielo/.test(e)) return "cold";
  if (/coster|maritim|costa|oleaje|galerna|rissag/.test(e)) return "coastal";
  if (/niebla|polvo|arena|calima/.test(e)) return "fog";
  return null;
}

// Los CAP de AEMET son UTF-8 (<?xml ... encoding="utf-8"?>); decodificar byte a
// byte rompía tildes y eñes ("Coruña" → "CoruÃ±a") y con ello el filtro de
// subzonas y el texto mostrado.
export function decodeTarText(bytes: Uint8Array): string {
  const text = new TextDecoder("utf-8").decode(bytes);
  // Si no era UTF-8 válido (U+FFFD), vuelve a la lectura byte a byte (Latin-1).
  if (text.includes("\uFFFD")) {
    let latin1 = "";
    for (let i = 0; i < bytes.length; i++) latin1 += String.fromCharCode(bytes[i]);
    return latin1;
  }
  return text;
}

function parseTar(buffer: ArrayBuffer): string[] {
  const bytes = new Uint8Array(buffer);
  const files: string[] = [];
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.slice(offset, offset + 512);

    if (header.every((b) => b === 0)) break;

    const sizeStr = String.fromCharCode(...header.slice(124, 136)).replace(/\0/g, "").trim();
    const size = parseInt(sizeStr, 8);
    if (isNaN(size) || size === 0) { offset += 512; continue; }

    const typeFlag = String.fromCharCode(header[156]);
    offset += 512;

    const paddedSize = Math.ceil(size / 512) * 512;

    if (typeFlag === "\0" || typeFlag === "0" || typeFlag === "") {
      if (offset + size > bytes.length) break;
      const data = bytes.slice(offset, offset + size);
      files.push(decodeTarText(data));
    }

    offset += paddedSize;
  }

  return files;
}

interface CAPArea {
  areaDesc?: string;
}

interface CAPAlertInfo {
  language?: string;
  event?: string;
  severity?: string;
  urgency?: string;
  certainty?: string;
  onset?: string;
  expires?: string;
  headline?: string;
  description?: string;
  area?: CAPArea | CAPArea[];
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match por palabra completa e insensible a acentos: "Oeste" hace match con
// "Sur, Vegas y Oeste" pero no con "Noroeste de Murcia".
function matchesSubzone(areaDescs: string[], patterns: string[]): boolean {
  return patterns.some((p) => {
    const pat = stripAccents(p).trim();
    if (!pat) return false;
    const re = new RegExp(`(^|[^a-z])${escapeRegExp(pat)}([^a-z]|$)`);
    return areaDescs.some((desc) => re.test(stripAccents(desc)));
  });
}

export function parseCAPAlert(
  parsed: any,
  zonaCode: string,
  subzonePatterns?: string[],
  now: Date = new Date()
): WeatherAlert | null {
  const alert = parsed.alert || parsed["alert"] || parsed;
  if (!alert) return null;

  // Solo avisos reales y vigentes: ni pruebas, ni cancelaciones, ni caducados.
  if (alert.status && alert.status !== "Actual") return null;
  if (alert.msgType === "Cancel") return null;

  let infos: CAPAlertInfo[] = [];
  if (alert.info) {
    infos = Array.isArray(alert.info) ? alert.info : [alert.info];
  }
  if (infos.length === 0) return null;

  const esInfo = infos.find((i) => i.language && i.language.startsWith("es"));
  const info = esInfo || infos[0];

  const event = info.event || "";
  const type = capEventToType(event);
  if (!type) return null;

  const capSeverity = info.severity || "";
  const severity = CAP_SEVERITY[capSeverity];
  if (!severity) return null;

  const areas = Array.isArray(info.area) ? info.area : info.area ? [info.area] : [];
  const areaDescs = areas
    .map((a) => a?.areaDesc)
    .filter((d): d is string => Boolean(d));

  if (subzonePatterns && subzonePatterns.length > 0 && areaDescs.length > 0) {
    if (!matchesSubzone(areaDescs, subzonePatterns)) return null;
  }

  const onset = info.onset || now.toISOString();
  const expires = info.expires || new Date(now.getTime() + 24 * 3600000).toISOString();
  if (new Date(expires).getTime() <= now.getTime()) return null;
  const areaDesc = areaDescs.join("; ");
  // La zona va primero: es lo que distingue "Sierra de Madrid" de la capital y
  // es lo primero que se lee en la notificación.
  const description = [areaDesc, info.description].filter(Boolean).join("\n");

  // El slug del área distingue avisos del mismo tipo/severidad/día en subzonas
  // distintas; sin él colisionarían los ids y el dedup suprimiría avisos reales.
  const areaSlug = stripAccents(areaDesc).replace(/[^a-z0-9]/g, "").slice(0, 24);

  // "Aviso de lluvias de nivel amarillo. Suroeste de A Coruña" → "Aviso de lluvias":
  // el nivel lo dice el chip y la zona va en la descripción.
  const title = (info.headline || event)
    .replace(/\.\s.*$/, "")
    .replace(/\s+de nivel (amarillo|naranja|rojo)/i, "")
    .trim();

  return {
    id: `aemet-${zonaCode}-${type}-${severity}-${onset.slice(0, 10)}${areaSlug ? `-${areaSlug}` : ""}`,
    title,
    description,
    severity,
    type,
    startTime: onset,
    endTime: expires,
  };
}

export async function getAEMETAlerts(
  zonaCode: string,
  subzonePatterns?: string[]
): Promise<WeatherAlert[]> {
  try {
    const ccaa = getCCAACode(zonaCode);
    if (!ccaa) return [];

    const res = await fetch(
      `${BASE_URL}/api/avisos_cap/ultimoelaborado/area/${ccaa}`,
      {
        headers: {
          api_key: config.apiKey,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return [];

    const json = await res.json();
    if (!json.datos) return [];

    const tarRes = await fetch(json.datos);
    if (!tarRes.ok) return [];

    const tarBuffer = await tarRes.arrayBuffer();

    const xmlFiles = parseTar(tarBuffer);
    if (xmlFiles.length === 0) return [];

    const parser = new XMLParser({ ignoreAttributes: true });
    // Un aviso y su actualización (msgType Update) comparten id: se queda el
    // que caduque más tarde.
    const byId = new Map<string, WeatherAlert>();

    for (const xml of xmlFiles) {
      try {
        const parsed = parser.parse(xml);
        const alert = parseCAPAlert(parsed, zonaCode, subzonePatterns);
        if (!alert) continue;
        const prev = byId.get(alert.id);
        if (!prev || new Date(alert.endTime) > new Date(prev.endTime)) byId.set(alert.id, alert);
      } catch {
        // skip malformed XML
      }
    }

    return [...byId.values()];
  } catch {
    return [];
  }
}

export async function getAEMETForecast(municipioCode: string) {
  return aemetFetch<any>(`/api/prediccion/especifica/municipio/diaria/${municipioCode}`);
}

export function isAEMETConfigured(): boolean {
  return config.apiKey !== "";
}
