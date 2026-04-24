import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { getWeather } from "@/services/openmeteo";
import { generateAlerts } from "@/services/alerts";
import { scheduleAlertNotification } from "@/services/notifications";
import { createMMKV } from "react-native-mmkv";
import type { City, AppSettings } from "@/types/weather";

const storage = createMMKV({ id: "tiempo-storage" });
const BACKGROUND_TASK = "background-alerts";

const lastAlertIds = new Set<string>();

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    const citiesJson = storage.getString("cities");
    const settingsJson = storage.getString("settings");
    if (!citiesJson || !settingsJson) return BackgroundFetch.BackgroundFetchResult.NoData;

    const cities: City[] = JSON.parse(citiesJson);
    const settings: AppSettings = JSON.parse(settingsJson);

    if (!settings.notifications.enabled) return BackgroundFetch.BackgroundFetchResult.NoData;

    let newAlerts = 0;

    for (const city of cities.slice(0, 3)) {
      try {
        const weather = await getWeather(city.lat, city.lon, city.name);
        const alerts = generateAlerts(weather);

        for (const alert of alerts) {
          const typeKey = alert.type as keyof typeof settings.notifications;
          if (typeKey !== "enabled" && !settings.notifications[typeKey]) continue;
          if (lastAlertIds.has(alert.id)) continue;

          await scheduleAlertNotification(alert);
          lastAlertIds.add(alert.id);
          newAlerts++;
        }
      } catch {
        continue;
      }
    }

    if (newAlerts > 0) {
      storage.set("lastAlertCheck", Date.now());
    }

    return newAlerts > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

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
