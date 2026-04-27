import { View, ScrollView, TouchableOpacity, Alert, Switch, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext, ThemedText, ThemedCard } from "@/components/theme";
import { screenBackground } from "@/constants/theme";
import { useSettingsStore, useCityStore } from "@/stores/cityStore";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { SwipeableCityRow } from "@/components/city";
import { useRouter } from "expo-router";
import { Moon, Sun, Monitor, Plus, Navigation, Thermometer, Bell, CloudRain, CloudLightning, Snowflake, Wind, ThermometerSun, ThermometerSnowflake, Waves, Key, Palette, CircleDot } from "lucide-react-native";
import { useLocation } from "@/hooks/useLocation";
import { requestNotificationPermissions, setupNotificationChannel } from "@/services/notifications";
import { registerBackgroundFetch, unregisterBackgroundFetch } from "@/services/backgroundAlerts";
import type { ThemeMode, IconStyle } from "@/types/weather";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const { isDark } = useThemeContext();
  const { settings, updateSettings } = useSettingsStore();
  const { cities, activeCity, setActiveCity, removeCity, setLocationCity } = useCityStore();
  const { city: locationCity, loading: locationLoading, requestAndSet } = useLocation();
  const router = useRouter();

  const themeOptions: { label: string; value: ThemeMode; icon: any }[] = [
    { label: "Auto", value: "system", icon: Monitor },
    { label: "Claro", value: "light", icon: Sun },
    { label: "Oscuro", value: "dark", icon: Moon },
  ];

  const iconStyleOptions: { label: string; value: IconStyle; icon: any }[] = [
    { label: "Color", value: "colored", icon: Palette },
    { label: "Monocromo", value: "monochrome", icon: CircleDot },
  ];

  const activeColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  const handleDeleteCity = (id: string) => {
    const city = cities.find((c) => c.id === id);
    Alert.alert("Eliminar ciudad", `¿Quieres eliminar ${city?.name ?? "esta ciudad"}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeCity(id) },
    ]);
  };

  const handleUseLocation = async () => {
    if (locationCity) {
      setLocationCity(locationCity);
    } else {
      await requestAndSet();
      if (locationCity) {
        setLocationCity(locationCity);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? screenBackground.dark : screenBackground.light }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <ThemedText style={{ fontSize: 34, fontWeight: "600", marginBottom: 24 }}>
          Ajustes
        </ThemedText>

        <ThemedCard style={{ marginBottom: 16 }}>
          <ThemedText
            secondary
            style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 16, letterSpacing: 0.5 }}
          >
            Apariencia
          </ThemedText>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {themeOptions.map((opt) => {
          const isActive = settings.theme === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateSettings({ theme: opt.value })}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isActive ? activeColor : "transparent",
              }}
            >
              <opt.icon size={16} color={iconColor} />
              <ThemedText style={{ fontSize: 14, fontWeight: isActive ? "600" : "400" }}>
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ThemedText
        secondary
        style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginTop: 16, marginBottom: 12, letterSpacing: 0.5 }}
      >
        Iconos
      </ThemedText>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {iconStyleOptions.map((opt) => {
          const isActive = settings.iconStyle === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateSettings({ iconStyle: opt.value })}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isActive ? activeColor : "transparent",
              }}
            >
              <opt.icon size={16} color={isActive ? (opt.value === "colored" ? "#FFB800" : iconColor) : iconColor} />
              <ThemedText style={{ fontSize: 14, fontWeight: isActive ? "600" : "400" }}>
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
        </ThemedCard>

        <ThemedCard style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <ThemedText
              secondary
              style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Ciudades
            </ThemedText>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={handleUseLocation} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                {locationLoading ? null : <Navigation size={16} color="#2196F3" />}
                <ThemedText style={{ fontSize: 14, color: "#2196F3", fontWeight: "500" }}>
                  {locationLoading ? "Localizando..." : "GPS"}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/search")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={16} color="#2196F3" />
                <ThemedText style={{ fontSize: 14, color: "#2196F3", fontWeight: "500" }}>Añadir</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {cities.map((city) => (
            <SwipeableCityRow
              key={city.id}
              city={city}
              isActive={city.id === activeCity.id}
              canDelete={cities.length > 1}
              onSelect={setActiveCity}
              onDelete={handleDeleteCity}
            />
          ))}
        </ThemedCard>

<ThemedCard style={{ marginBottom: 16 }}>
      <ThemedText
        secondary
        style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 16, letterSpacing: 0.5 }}
      >
        Unidades
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Thermometer size={16} color={iconColor} />
            <ThemedText style={{ fontSize: 16, flex: 1 }}>Temperatura</ThemedText>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["celsius", "fahrenheit"] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => updateSettings({ temperatureUnit: unit })}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: settings.temperatureUnit === unit ? activeColor : "transparent",
                  }}
                >
                  <ThemedText style={{ fontSize: 14, fontWeight: settings.temperatureUnit === unit ? "600" : "400" }}>
                    {unit === "celsius" ? "°C" : "°F"}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedCard>

        <ThemedCard style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Bell size={16} color={iconColor} />
            <ThemedText
              secondary
              style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Notificaciones
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <ThemedText style={{ fontSize: 16 }}>Activar alertas</ThemedText>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(enabled) => {
                if (enabled) {
                  requestNotificationPermissions().then((granted) => {
                    if (granted) {
                      setupNotificationChannel();
                      registerBackgroundFetch();
                      updateSettings({ notifications: { ...settings.notifications, enabled: true } });
                    } else {
                      Alert.alert("Permiso denegado", "Activa las notificaciones en los ajustes del sistema.");
                    }
                  });
                } else {
                  unregisterBackgroundFetch();
                  updateSettings({ notifications: { ...settings.notifications, enabled: false } });
                }
              }}
              trackColor={{ false: isDark ? "#333" : "#E0E0E0", true: isDark ? "#5AC8FA" : "#007AFF" }}
              thumbColor="#FFF"
            />
          </View>

          {settings.notifications.enabled && (
            <View style={{ gap: 10, marginTop: 4 }}>
              <NotificationToggle
                label="Lluvia"
                icon={CloudRain}
                value={settings.notifications.rain}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, rain: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Tormenta"
                icon={CloudLightning}
                value={settings.notifications.storm}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, storm: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Nieve"
                icon={Snowflake}
                value={settings.notifications.snow}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, snow: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Viento"
                icon={Wind}
                value={settings.notifications.wind}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, wind: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Calor / UV"
                icon={ThermometerSun}
                value={settings.notifications.heat}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, heat: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Frío"
                icon={ThermometerSnowflake}
                value={settings.notifications.cold}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, cold: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
              <NotificationToggle
                label="Costera"
                icon={Waves}
                value={settings.notifications.coastal}
                onValueChange={(v) => updateSettings({ notifications: { ...settings.notifications, coastal: v } })}
                iconColor={iconColor}
                isDark={isDark}
              />
            </View>
          )}
      </ThemedCard>

      <ThemedCard style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Key size={16} color={iconColor} />
          <ThemedText
            secondary
            style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Claves API
          </ThemedText>
        </View>
        <ThemedText
          secondary
          style={{ fontSize: 12, lineHeight: 18, marginBottom: 12 }}
        >
          Introduce tu clave de OpenWeatherMap para activar las capas de temperatura, viento y más en el mapa.
        </ThemedText>
        <ApiKeyInput
          value={settings.openWeatherMapApiKey ?? ""}
          onSave={(key) => updateSettings({ openWeatherMapApiKey: key })}
          isDark={isDark}
        />
      </ThemedCard>
    </ScrollView>

    <BottomNavBar />
    </SafeAreaView>
  );
}

function NotificationToggle({
  label,
  icon: Icon,
  value,
  onValueChange,
  iconColor,
  isDark,
}: {
  label: string;
  icon: any;
  value: boolean;
  onValueChange: (v: boolean) => void;
  iconColor: string;
  isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon size={16} color={iconColor} />
        <ThemedText style={{ fontSize: 14 }}>{label}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? "#333" : "#E0E0E0", true: isDark ? "#5AC8FA" : "#007AFF" }}
        thumbColor="#FFF"
      />
    </View>
  );
}

function ApiKeyInput({
  value,
  onSave,
  isDark,
}: {
  value: string;
  onSave: (key: string) => void;
  isDark: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const hasKey = value.length > 0;

  if (!editing) {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <ThemedText style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
          {hasKey ? `${value.slice(0, 4)}${"*".repeat(Math.max(0, value.length - 4))}` : "Sin configurar"}
        </ThemedText>
        <TouchableOpacity
          onPress={() => { setDraft(value); setEditing(true); }}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: isDark ? "rgba(90,200,250,0.15)" : "rgba(0,122,255,0.1)",
          }}
        >
          <ThemedText style={{ fontSize: 13, fontWeight: "500", color: isDark ? "#5AC8FA" : "#007AFF" }}>
            {hasKey ? "Editar" : "Añadir"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="API Key de OpenWeatherMap"
        placeholderTextColor={isDark ? "#666" : "#999"}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={{
          fontSize: 14,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          color: isDark ? "#FFF" : "#000",
          fontFamily: "monospace",
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <TouchableOpacity
          onPress={handleCancel}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
        >
          <ThemedText secondary style={{ fontSize: 13, fontWeight: "500" }}>Cancelar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: isDark ? "#5AC8FA" : "#007AFF",
          }}
        >
          <ThemedText style={{ fontSize: 13, fontWeight: "500", color: "#FFF" }}>Guardar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
