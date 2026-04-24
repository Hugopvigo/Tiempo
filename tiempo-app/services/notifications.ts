import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { WeatherAlert } from "@/types/weather";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleAlertNotification(alert: WeatherAlert): Promise<string> {
  const emoji = typeEmoji(alert.type);
  const color = alert.severity === "red" ? "🔴" : alert.severity === "orange" ? "🟠" : "🟡";

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${color} ${alert.title}`,
      body: alert.description,
      sound: alert.severity === "red" || alert.severity === "orange",
      badge: 1,
      data: { alertId: alert.id, type: alert.type },
    },
    trigger: null,
  });
}

export async function cancelAllAlertNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

function typeEmoji(type: WeatherAlert["type"]): string {
  switch (type) {
    case "rain":
      return "🌧️";
    case "storm":
      return "⛈️";
    case "snow":
      return "❄️";
    case "wind":
      return "💨";
    case "heat":
      return "🌡️";
    case "cold":
      return "🥶";
    case "coastal":
      return "🌊";
  }
}

export function setupNotificationChannel(): void {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("weather-alerts", {
      name: "Alertas meteorológicas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF9500",
      sound: "default",
      description: "Notificaciones de avisos meteorológicos",
    });
  }
}
