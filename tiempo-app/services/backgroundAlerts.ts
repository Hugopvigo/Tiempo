import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { getWeather } from "@/services/openmeteo";
import { generateAlerts } from "@/services/alerts";
import { configureAEMET, getAEMETAlerts, isAEMETConfigured } from "@/services/aemet";
import { getAEMETZone, getAEMETSubzonePatterns } from "@/constants/aemetZones";
import { scheduleAlertNotification, setBadgeCount } from "@/services/notifications";
import { createMMKV } from "react-native-mmkv";
import type { City, AppSettings, WeatherAlert } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });
const BACKGROUND_TASK = "background-alerts";

const ALERT_DEDUP_TTL = 24 * 60 * 60 * 1000;

interface DedupEntry {
  id: string;
  timestamp: number;
}

function loadLastAlertIds(): DedupEntry[] {
  try {
    const json = storage.getString("lastAlertIds");
    if (!json) return [];
    const entries: DedupEntry[] = JSON.parse(json);
    const cutoff = Date.now() - ALERT_DEDUP_TTL;
    return entries.filter((e) => e.timestamp > cutoff);
  } catch {
    return [];
  }
}

function saveLastAlertIds(entries: DedupEntry[]): void {
  const cutoff = Date.now() - ALERT_DEDUP_TTL;
  const filtered = entries.filter((e) => e.timestamp > cutoff);
  storage.set("lastAlertIds", JSON.stringify(filtered));
}

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    const citiesJson = storage.getString("cities");
    const settingsJson = storage.getString("settings");
    if (!citiesJson || !settingsJson) return BackgroundFetch.BackgroundFetchResult.NoData;

    const cities: City[] = JSON.parse(citiesJson);
    const settings: AppSettings = JSON.parse(settingsJson);

    if (!settings.notifications.enabled) return BackgroundFetch.BackgroundFetchResult.NoData;

    if (settings.aemetApiKey) {
      configureAEMET(settings.aemetApiKey);
    }

    let totalActive = 0;
    let newAlerts = 0;
    const dedupEntries = loadLastAlertIds();
    const dedupIds = new Set(dedupEntries.map((e) => e.id));

    for (const city of cities.slice(0, 3)) {
      try {
        const weather = await getWeather(city.lat, city.lon, city.name);
        const localAlerts = generateAlerts(weather);

        let alerts: WeatherAlert[];
        const zonaCode = getAEMETZone(city);
        const subzonePatterns = getAEMETSubzonePatterns(city);

        if (isAEMETConfigured() && zonaCode) {
          const aemetAlerts = await getAEMETAlerts(zonaCode, subzonePatterns);
          if (aemetAlerts.length > 0) {
            const aemetTypes = new Set(aemetAlerts.map((a) => a.type));
            const complement = localAlerts.filter((a) => !aemetTypes.has(a.type));
            alerts = [...aemetAlerts, ...complement];
          } else {
            alerts = localAlerts;
          }
        } else {
          alerts = localAlerts;
        }

        alerts.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

        for (const alert of alerts) {
          const typeKey = alert.type as keyof typeof settings.notifications;
          if (typeKey !== "enabled" && !settings.notifications[typeKey]) continue;
          totalActive++;
          if (dedupIds.has(alert.id)) continue;

          await scheduleAlertNotification(alert);
          dedupEntries.push({ id: alert.id, timestamp: Date.now() });
          dedupIds.add(alert.id);
          newAlerts++;
        }
      } catch {
        continue;
      }
    }

    saveLastAlertIds(dedupEntries);

    if (newAlerts > 0) {
      storage.set("lastAlertCheck", Date.now());
    }
    if (totalActive > 0) {
      await setBadgeCount(totalActive);
    } else {
      await setBadgeCount(0);
    }

    return newAlerts > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

function severityOrder(s: WeatherAlert["severity"]): number {
  return s === "red" ? 0 : s === "orange" ? 1 : 2;
}

export async function registerBackgroundFetch(): Promise<boolean> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (isRegistered) return true;

    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 30 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return true;
  } catch {
    return false;
  }
}

export async function unregisterBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
    }
  } catch {
    // ignore
  }
}
