import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import type { City, AppSettings } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });

function safeParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

const savedCities = storage.getString("cities");
const savedActiveCity = storage.getString("activeCity");

const defaultCity: City = {
  id: "madrid-es",
  name: "Madrid",
  country: "España",
  admin1: "Madrid",
  lat: 40.4168,
  lon: -3.7038,
};

interface CityState {
  cities: City[];
  activeCity: City;
  addCity: (city: City) => void;
  removeCity: (id: string) => void;
  setActiveCity: (city: City) => void;
  setLocationCity: (city: City) => void;
  reorderCities: (cities: City[]) => void;
}

export const useCityStore = create<CityState>((set, get) => ({
  cities: safeParse(savedCities, [defaultCity]),
  activeCity: safeParse(savedActiveCity, defaultCity),

  addCity: (city) => {
    const { cities } = get();
    if (cities.some((c) => c.id === city.id)) return;
    const updated = [...cities, city];
    storage.set("cities", JSON.stringify(updated));
    set({ cities: updated });
  },

  removeCity: (id) => {
    const { cities, activeCity } = get();
    const updated = cities.filter((c) => c.id !== id);
    if (updated.length === 0) return;
    storage.set("cities", JSON.stringify(updated));
    const newActive = activeCity.id === id ? updated[0] : activeCity;
    if (activeCity.id === id) storage.set("activeCity", JSON.stringify(newActive));
    set({ cities: updated, activeCity: newActive });
  },

  setActiveCity: (city) => {
    storage.set("activeCity", JSON.stringify(city));
    set({ activeCity: city });
  },

  setLocationCity: (city) => {
    const { cities } = get();
    const locationCity: City = { ...city, id: "gps-current", isLocation: true };
    const updated = [locationCity, ...cities.filter((c) => !c.isLocation)];
    storage.set("cities", JSON.stringify(updated));
    storage.set("activeCity", JSON.stringify(locationCity));
    set({ cities: updated, activeCity: locationCity });
  },

  reorderCities: (newCities) => {
    storage.set("cities", JSON.stringify(newCities));
    set({ cities: newCities });
  },
}));

const savedSettings = storage.getString("settings");
const defaultSettings: AppSettings = {
  theme: "system",
  iconStyle: "colored",
  notifications: {
    enabled: true,
    rain: true,
    storm: true,
    snow: true,
    wind: false,
    heat: true,
    cold: true,
    coastal: false,
    fog: true,
  },
  temperatureUnit: "celsius",
  windUnit: "kmh",
  openWeatherMapApiKey: "",
  aemetApiKey: "",
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: safeParse(savedSettings, defaultSettings),

  updateSettings: (partial) => {
    const { settings } = get();
    const updated = { ...settings, ...partial };
    storage.set("settings", JSON.stringify(updated));
    set({ settings: updated });
  },
}));

/**
 * Rellena la provincia (admin2) de las ciudades guardadas antes de que se
 * almacenara. Sin ella, los avisos AEMET se acotan solo por comunidad.
 */
export async function backfillCityProvinces(): Promise<void> {
  const { getCityAdminById } = await import("@/services/openmeteo");
  const { cities } = useCityStore.getState();
  const pending = cities.filter((c) => !c.admin2 && /^\d+$/.test(c.id));
  if (pending.length === 0) return;
  const updates = new Map<string, { admin1: string; admin2: string }>();
  for (const c of pending) {
    try {
      const admin = await getCityAdminById(c.id);
      if (admin?.admin2) updates.set(c.id, admin);
    } catch {
      // sin red: se reintenta en el próximo arranque
    }
  }
  if (updates.size === 0) return;
  const current = useCityStore.getState();
  const patched = current.cities.map((c) => (updates.has(c.id) ? { ...c, ...updates.get(c.id)! } : c));
  const active = updates.has(current.activeCity.id)
    ? { ...current.activeCity, ...updates.get(current.activeCity.id)! }
    : current.activeCity;
  storage.set("cities", JSON.stringify(patched));
  storage.set("activeCity", JSON.stringify(active));
  useCityStore.setState({ cities: patched, activeCity: active });
}

export { storage };
