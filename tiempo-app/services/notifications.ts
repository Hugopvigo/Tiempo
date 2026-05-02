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
  const color = alert.severity === "red" ? "🔴" : alert.severity === "orange" ? "🟠" : "🟡";

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${color} ${alert.title}`,
      body: alert.description,
      sound: alert.severity === "red" || alert.severity === "orange",
      data: { alertId: alert.id, type: alert.type },
      ...(Platform.OS === "android" ? { channelId: "weather-alerts" } : {}),
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

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("weather-alerts", {
      name: "Alertas meteorológicas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF9500",
      sound: "default",
      description: "Notificaciones de avisos meteorológicos",
    });
  }
}
