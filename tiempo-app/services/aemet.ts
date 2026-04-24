const BASE_URL = "https://opendata.aemet.es/opendapi";

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
      "api_key": config.apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`AEMET error: ${res.status}`);

  const data = await res.json();
  if (data.datos) {
    const dataRes = await fetch(data.datos);
    return dataRes.json();
  }

  return data;
}

export async function getAEMETForecast(municipioCode: string) {
  return aemetFetch<any>(`/api/prediccion/especifica/municipio/diaria/${municipioCode}`);
}

export async function getAEMETAlerts(zonaCode: string) {
  return aemetFetch<any>(`/api/avisos_cap/${zonaCode}`);
}

export async function getAEMETTides(puertoCode: string) {
  return aemetFetch<any>(`/api/prediccion/maritiva/puerto/${puertoCode}`);
}

export function isAEMETConfigured(): boolean {
  return config.apiKey !== "";
}
