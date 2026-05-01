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

export function getAEMETZone(city: City): string | undefined {
  if (!city.admin1) return undefined;
  const normalized = city.admin1.trim();
  return ADMIN1_TO_AEMET_ZONE[normalized];
}
