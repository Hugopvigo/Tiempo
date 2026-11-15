import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { WeatherAlert } from "@/types/weather";
import type { NotificationText } from "@/utils/alertFormat";
import { alertColors } from "@/constants/theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// En Android 8+ el sonido y la importancia los decide el canal, no cada
// notificación: por eso hay uno por tipo de mensaje.
const CHANNEL_ALERTS = "weather-alerts"; // avisos nuevos y subidas de nivel
const CHANNEL_INFO = "weather-info"; // resumen de la mañana y lluvia próxima
const CHANNEL_QUIET = "weather-quiet"; // fin de un aviso, sin sonido

const MORNING_SUMMARY_ID = "morning-summary";
const RAIN_SOON_ID = "rain-soon";

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// El canal va en el trigger; en content se ignora y la notificación saldría
// por el canal por defecto (sin sonido ni heads-up).
function now(channelId: string): Notifications.NotificationTriggerInput {
  return Platform.OS === "android" ? { channelId } : null;
}

/**
 * Aviso nuevo o que sube de nivel. `identifier` es estable por aviso: la
 * subida sustituye a la notificación anterior en vez de apilarse.
 */
export async function notifyAlert(
  identifier: string,
  text: NotificationText,
  alert: WeatherAlert,
  url: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: text.title,
      body: text.body,
      color: alertColors[alert.severity],
      sound: alert.severity !== "yellow",
      data: { url },
    },
    trigger: now(CHANNEL_ALERTS),
  });
}

/** Fin de un aviso: sustituye a la notificación del aviso, sin sonido. */
export async function notifyAlertEnded(identifier: string, text: NotificationText): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title: text.title, body: text.body, sound: false, data: { url: "/" } },
    trigger: now(CHANNEL_QUIET),
  });
}

export async function notifyRainSoon(text: NotificationText): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: RAIN_SOON_ID,
    content: { title: text.title, body: text.body, sound: false, data: { url: "/" } },
    trigger: now(CHANNEL_INFO),
  });
}

/**
 * Programa (o actualiza, mismo identificador) el resumen para `date`. Se
 * vuelve a llamar en cada comprobación con la previsión más reciente.
 */
export async function scheduleMorningSummary(text: NotificationText, date: Date): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_SUMMARY_ID,
    content: { title: text.title, body: text.body, sound: false, data: { url: "/" } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_INFO,
    },
  });
}

export async function cancelMorningSummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_SUMMARY_ID).catch(() => {});
}

export async function cancelAllAlertNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ALERTS, {
    name: "Avisos meteorológicos",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF9500",
    sound: "default",
    description: "Avisos nuevos y cambios de nivel",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_INFO, {
    name: "Resumen y lluvia próxima",
    importance: Notifications.AndroidImportance.DEFAULT,
    description: "Resumen de la mañana y lluvia en la próxima hora",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_QUIET, {
    name: "Fin de avisos",
    importance: Notifications.AndroidImportance.LOW,
    description: "Cuando un aviso deja de estar vigente",
  });
}
