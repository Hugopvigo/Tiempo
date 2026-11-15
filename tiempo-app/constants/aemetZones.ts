import type { City } from "@/types/weather";
import { zoneNamesForProvince } from "./meteoalertaZonas";

const ADMIN1_TO_AEMET_ZONE: Record<string, string> = {
  "Andalucía": "AND",
  "Aragón": "ARA",
  "Asturias": "AST",
  "Principado de Asturias": "AST",
  "Canarias": "CAN",
  "Cantabria": "SAN",
  "Castilla-La Mancha": "CLM",
  "Castilla la Mancha": "CLM",
  "Castilla y León": "CYL",
  "Castilla y Leon": "CYL",
  "Catalunya": "CAT",
  "Cataluña": "CAT",
  "Catalonia": "CAT",
  "Comunitat Valenciana": "VAL",
  "Comunidad Valenciana": "VAL",
  "Valenciana": "VAL",
  "Extremadura": "EXT",
  "Galicia": "GAL",
  "Illes Balears": "IB",
  "Islas Baleares": "IB",
  "Baleares": "IB",
  "Madrid": "MAD",
  "Comunidad de Madrid": "MAD",
  "Murcia": "MUR",
  "Región de Murcia": "MUR",
  "Region de Murcia": "MUR",
  "Navarra": "NAV",
  "Comunidad Foral de Navarra": "NAV",
  "País Vasco": "PVA",
  "Euskadi": "PVA",
  "Pais Vasco": "PVA",
  "La Rioja": "RIO",
  "Rioja": "RIO",
  "Ceuta": "CEU",
  "Melilla": "MEL",
};

// Códigos oficiales del parámetro `area` de /api/avisos_cap/ultimoelaborado/area/{area}
// según la especificación de AEMET OpenData (AEMET_OpenData_specification.json).
const ZONE_TO_CCAA: Record<string, string> = {
  AND: "61",
  ARA: "62",
  AST: "63",
  IB: "64",
  CAN: "65",
  SAN: "66",
  CYL: "67",
  CLM: "68",
  CAT: "69",
  EXT: "70",
  GAL: "71",
  MAD: "72",
  MUR: "73",
  NAV: "74",
  PVA: "75",
  RIO: "76",
  VAL: "77",
  CEU: "78",
  MEL: "79",
};

// Open-Meteo devuelve "Comunidad Autónoma de Galicia", "Comunidad Autónoma del
// País Vasco", "Principado de Asturias"…; expo-location, el nombre a secas.
// Sin quitar el prefijo, las ciudades añadidas desde el buscador no tenían zona
// y no recibían ningún aviso de AEMET.
function normalizeAdmin1(admin1: string): string {
  return admin1
    .trim()
    .replace(/^(Comunidad Autónoma|Comunitat Autònoma|Comunidad Foral|Región|Regió|Ciudad Autónoma)\s+(de las|de los|de la|del|de)\s+/i, "")
    .trim();
}

export function getAEMETZone(city: City): string | undefined {
  if (!city.admin1) return undefined;
  const raw = city.admin1.trim();
  return ADMIN1_TO_AEMET_ZONE[raw] ?? ADMIN1_TO_AEMET_ZONE[normalizeAdmin1(raw)];
}

export function getCCAACode(zonaCode: string): string | undefined {
  return ZONE_TO_CCAA[zonaCode];
}

/**
 * Patrones de nombre de zona Meteoalerta (CAP <areaDesc>) para una ciudad.
 * Lista vacía = sin filtro: se muestran todos los avisos de la comunidad.
 *
 * Orden: zona concreta si conocemos la ciudad (Madrid capital está en
 * "Metropolitana y Henares", Vigo en "Rias Baixas"); si no, todas las zonas de
 * su provincia (admin2 de la geocodificación); si tampoco, toda la comunidad.
 * El admin1 no se usa como patrón: "Galicia" no aparece en ningún nombre de
 * zona y "Madrid" casaba con "Sierra de Madrid" (avisos de nieve de la Sierra
 * para la capital y para Getafe).
 */
export function getAEMETSubzonePatterns(city: City): string[] {
  // Nombre exacto: por subcadena, "madrid" casaba con Madridejos (Toledo).
  const exact = CITY_KEYWORD_ZONES[city.name.trim().toLowerCase()];
  if (exact) return exact;

  return zoneNamesForProvince(city.admin2);
}

// Ciudad (nombre exacto, en minúsculas) → zona Meteoalerta en la que está. Solo
// las que se saben seguras; el resto cae en las zonas de su provincia.
const CITY_KEYWORD_ZONES: Record<string, string[]> = {
  "madrid": ["Metropolitana y Henares"],
  "alcalá de henares": ["Metropolitana y Henares"],
  "alcala de henares": ["Metropolitana y Henares"],
  "vigo": ["Rias Baixas"],
  "pontevedra": ["Rias Baixas"],
};
