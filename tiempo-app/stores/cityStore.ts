import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import type { City, AppSettings } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });

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
  cities: savedCities ? JSON.parse(savedCities) : [defaultCity],
  activeCity: savedActiveCity ? JSON.parse(savedActiveCity) : defaultCity,

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
  notifications: {
    enabled: true,
    rain: true,
    storm: true,
    snow: true,
    wind: false,
    heat: true,
    cold: true,
    coastal: false,
  },
  temperatureUnit: "celsius",
  windUnit: "kmh",
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: savedSettings ? JSON.parse(savedSettings) : defaultSettings,

  updateSettings: (partial) => {
    const { settings } = get();
    const updated = { ...settings, ...partial };
    storage.set("settings", JSON.stringify(updated));
    set({ settings: updated });
  },
}));

export { storage };
