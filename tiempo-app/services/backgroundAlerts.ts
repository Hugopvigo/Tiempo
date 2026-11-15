import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { getWeather } from "@/services/openmeteo";
import { generateAlerts } from "@/services/alerts";
import { configureAEMET, getAEMETAlerts, isAEMETConfigured } from "@/services/aemet";
import { getAEMETZone, getAEMETSubzonePatterns } from "@/constants/aemetZones";
import {
  notifyAlert,
  notifyAlertEnded,
  dismissAlertNotification,
  notifyRainSoon,
  scheduleMorningSummary,
  cancelMorningSummary,
  setBadgeCount,
} from "@/services/notifications";
import { newAlertText, upgradedAlertText, endedAlertText, alertDetailUrl } from "@/utils/alertFormat";
import { planAlertNotifications, pruneAlertStates, alertKey, type AlertState } from "@/utils/alertState";
import { morningSummaryText, rainSoonText } from "@/utils/summaryText";
import { createMMKV } from "react-native-mmkv";
import type { City, AppSettings, WeatherAlert } from "@/types/weather";
import { saveWidgetData } from "@/widgets/widgetStorage";

const storage = createMMKV({ id: "tiempo-storage" });
const BACKGROUND_TASK = "background-alerts";

const RAIN_SOON_GAP = 6 * 60 * 60 * 1000;
const SUMMARY_HOUR = 8;

function loadAlertStates(): AlertState[] {
  try {
    const json = storage.getString("alertStates");
    return json ? (JSON.parse(json) as AlertState[]) : [];
  } catch {
    return [];
  }
}

// Identificador estable por aviso: la subida de nivel y el fin sustituyen a la
// notificación anterior.
function notificationId(key: string): string {
  return `alert-${key}`;
}

// Próximas 08:00: hoy si aún no han pasado, si no mañana.
function nextSummaryDate(now: Date): Date {
  const d = new Date(now);
  d.setHours(SUMMARY_HOUR, 0, 0, 0);
  if (d.getTime() <= now.getTime() + 60 * 1000) d.setDate(d.getDate() + 1);
  return d;
}

function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    let states = loadAlertStates();
    const checkedCities = cities.slice(0, 3);

    const activeCityJson = storage.getString("activeCity");
    const activeCityId: string | undefined = activeCityJson
      ? (JSON.parse(activeCityJson) as City).id
      : undefined;

    for (const city of checkedCities) {
      try {
        const weather = await getWeather(city.lat, city.lon, city.name);

        // Actualiza los datos del widget con la ciudad activa.
        if (city.id === activeCityId) {
          const daily0 = weather.daily[0];
          saveWidgetData({
            cityName: weather.cityName,
            temperature: weather.current.temperature,
            tempMax: daily0?.tempMax ?? weather.current.temperature,
            tempMin: daily0?.tempMin ?? weather.current.temperature,
            condition: weather.current.condition,
            description: weather.current.description,
            unit: settings.temperatureUnit,
            updatedAt: weather.updatedAt,
            forecast: weather.daily.slice(0, 7).map((d) => ({
              date: d.date,
              tempMax: d.tempMax,
              tempMin: d.tempMin,
              condition: d.condition,
              precipitationChance: d.precipitationChance,
            })),
          });
        }

        if (city.id === activeCityId) {
          if (settings.notifications.morningSummary) {
            const when = nextSummaryDate(new Date());
            const text = morningSummaryText(weather, localDateKey(when), settings.temperatureUnit);
            if (text) await scheduleMorningSummary(text, when);
          } else {
            await cancelMorningSummary();
          }

          if (settings.notifications.rainSoon) {
            const text = rainSoonText(weather);
            const last = storage.getNumber("lastRainSoon") ?? 0;
            if (text && Date.now() - last > RAIN_SOON_GAP) {
              await notifyRainSoon(text);
              storage.set("lastRainSoon", Date.now());
            }
          }
        }

        const localAlerts = generateAlerts(weather);

        let alerts: WeatherAlert[] = localAlerts;
        // Sin clave o sin zona no hay consulta que pueda fallar.
        let aemetOk = true;
        const zonaCode = getAEMETZone(city);

        if (isAEMETConfigured() && zonaCode) {
          const aemetAlerts = await getAEMETAlerts(
            zonaCode,
            getAEMETSubzonePatterns(city),
            { lat: city.lat, lon: city.lon }
          );
          aemetOk = aemetAlerts !== null;
          if (aemetAlerts && aemetAlerts.length > 0) {
            const aemetTypes = new Set(aemetAlerts.map((a) => a.type));
            alerts = [...aemetAlerts, ...localAlerts.filter((a) => !aemetTypes.has(a.type))];
          }
        }

        alerts = alerts
          .filter((a) => settings.notifications[a.type])
          .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
        totalActive += alerts.length;

        const plan = planAlertNotifications(states, {
          scope: city.id,
          alerts,
          aemetOk,
          now: Date.now(),
        });
        states = plan.next;

        for (const action of plan.actions) {
          if (action.kind === "dismiss") {
            await dismissAlertNotification(notificationId(action.state.key));
            continue;
          }
          if (action.kind === "ended") {
            await notifyAlertEnded(
              notificationId(action.state.key),
              endedAlertText(action.state.type, action.state.zone)
            );
            continue;
          }
          const text =
            action.kind === "upgraded" ? upgradedAlertText(action.alert) : newAlertText(action.alert);
          await notifyAlert(
            notificationId(alertKey(action.alert)),
            text,
            action.alert,
            alertDetailUrl(action.alert)
          );
          newAlerts++;
        }
      } catch {
        continue;
      }
    }

    storage.set(
      "alertStates",
      JSON.stringify(pruneAlertStates(states, checkedCities.map((c) => c.id), Date.now()))
    );

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
