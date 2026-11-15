import type { City } from "@/types/weather";

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

export function getAEMETZone(city: City): string | undefined {
  if (!city.admin1) return undefined;
  const normalized = city.admin1.trim();
  return ADMIN1_TO_AEMET_ZONE[normalized];
}

export function getCCAACode(zonaCode: string): string | undefined {
  return ZONE_TO_CCAA[zonaCode];
}

// Subzone override by city name: city name → subzone patterns to match
const CITY_SUBZONE_OVERRIDE: Record<string, string[]> = {};

/**
 * Patrones de nombre de zona Meteoalerta (CAP <areaDesc>) para una ciudad.
 * Lista vacía = sin filtro: se muestran todos los avisos de la comunidad.
 *
 * El admin1 (la comunidad) NO se usa como patrón: "Galicia" no aparece en
 * ningún nombre de zona (filtraba todos los avisos fuera de Galicia y
 * Madrid), y "Madrid" casaba con "Sierra de Madrid", con lo que Getafe
 * recibía solo los avisos de nieve de la Sierra y la capital los de las
 * tres zonas. Mejor enseñar toda la comunidad que una zona equivocada.
 */
export function getAEMETSubzonePatterns(city: City): string[] {
  const nameLower = city.name.toLowerCase();

  // Check explicit override first
  if (CITY_SUBZONE_OVERRIDE[city.name]) {
    return CITY_SUBZONE_OVERRIDE[city.name];
  }

  const patterns: string[] = [];

  // Try to extract province/county from city name or admin1 context
  const provinceKeywords: Record<string, string[]> = {
    "coruña": ["A Coruña", "Coruña", "Coruna"],
    "coruna": ["A Coruña", "Coruña", "Coruna"],
    "lugo": ["Lugo"],
    "ourense": ["Ourense"],
    "orense": ["Ourense"],
    "pontevedra": ["Pontevedra"],
    "santiago": ["A Coruña", "Coruña", "Coruna"],
    "ferrol": ["A Coruña", "Coruña", "Coruna"],
    "vigo": ["Pontevedra"],
    "rias": ["Rías Baixas", "Rias Baixas"],
    "madrid": ["Metropolitana"],
    "alcalá": ["Henares"],
    "alcala": ["Henares"],
  };

  for (const [key, zonePatterns] of Object.entries(provinceKeywords)) {
    if (nameLower.includes(key)) {
      patterns.push(...zonePatterns);
    }
  }

  // Deduplicate
  return [...new Set(patterns)];
}
