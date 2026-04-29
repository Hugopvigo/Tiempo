import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DynamicBackground, ThemedText, AnimatedView, WeatherParticles } from "@/components/theme";
import { CurrentWeather, HourlyForecastCard, DailyForecastCard, WeatherDetails, AirQualityCard, LunarPhaseCard } from "@/components/weather";
import { CurrentWeatherSkeleton, HourlyForecastSkeleton, DailyForecastSkeleton, WeatherDetailsSkeleton } from "@/components/ui/Skeleton";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { CitySelector } from "@/components/city";
import { AlertBanner } from "@/components/alerts";
import { useWeather } from "@/hooks/useWeather";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useLunarPhase } from "@/hooks/useLunarPhase";
import { useLocalAlerts } from "@/hooks/useAlerts";
import { useCities } from "@/hooks/useCities";
import { useThemeContext } from "@/components/theme";
import { useState, useCallback, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { requestNotificationPermissions, setupNotificationChannel, setBadgeCount, cancelAllAlertNotifications } from "@/services/notifications";
import { registerBackgroundFetch, unregisterBackgroundFetch } from "@/services/backgroundAlerts";
import { useSettingsStore } from "@/stores/cityStore";

export default function HomeScreen() {
  const { isDark } = useThemeContext();
  const { activeCity } = useCities();
  const { settings } = useSettingsStore();
  const { data: weather, isLoading, error, refetch, isRefetching } = useWeather(
    activeCity.lat,
    activeCity.lon,
    activeCity.name
  );
  const alerts = useLocalAlerts(weather);
  const { data: airQuality } = useAirQuality(activeCity.lat, activeCity.lon);
  const lunarPhase = useLunarPhase(activeCity.lat, activeCity.lon, weather?.daily);
  const [showCitySelector, setShowCitySelector] = useState(false);

  const condition = weather?.current.condition ?? "clear";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  useEffect(() => {
    setupNotificationChannel();
    if (settings.notifications.enabled) {
      requestNotificationPermissions().then((granted) => {
        if (granted) registerBackgroundFetch();
      }).catch(() => {});
    } else {
      unregisterBackgroundFetch();
      cancelAllAlertNotifications();
      setBadgeCount(0);
    }
  }, [settings.notifications.enabled]);

  useEffect(() => {
    if (alerts.length > 0 && settings.notifications.enabled) {
      setBadgeCount(alerts.length);
    } else {
      setBadgeCount(0);
    }
  }, [alerts.length, settings.notifications.enabled]);

  return (
  <DynamicBackground condition={condition}>
    <WeatherParticles condition={condition} isDark={isDark} />
    <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={isDark ? "#FFFFFF" : "#1C1C1E"}
              />
            }
          >
            <TouchableOpacity
              onPress={() => setShowCitySelector(true)}
              activeOpacity={0.6}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 8, paddingBottom: 4, gap: 4 }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
                {activeCity.isLocation ? "Mi ubicación" : activeCity.name}
              </ThemedText>
              <ChevronDown size={18} color={iconColor} />
            </TouchableOpacity>

            {weather && alerts.length > 0 && (
              <AlertBanner alerts={alerts} />
            )}

            {isLoading && (
              <View style={{ gap: 12 }}>
                <CurrentWeatherSkeleton />
                <HourlyForecastSkeleton />
                <DailyForecastSkeleton />
                <WeatherDetailsSkeleton />
              </View>
            )}

            {error && (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <ThemedText secondary style={{ fontSize: 18, textAlign: "center" }}>
                  No se pudo cargar el tiempo
                </ThemedText>
                <ThemedText
                  secondary
                  style={{ fontSize: 14, marginTop: 8, textDecorationLine: "underline" }}
                  onPress={() => refetch()}
                >
                  Reintentar
                </ThemedText>
              </View>
            )}

            {weather && (
              <View style={{ gap: 16 }}>
                <AnimatedView delay={0}>
                  <CurrentWeather
                    cityName={activeCity.isLocation ? "Mi ubicación" : activeCity.name}
                    temperature={weather.current.temperature}
                    feelsLike={weather.current.feelsLike}
                    condition={weather.current.condition}
                    description={weather.current.description}
                    tempMax={weather.daily[0]?.tempMax ?? 0}
                    tempMin={weather.daily[0]?.tempMin ?? 0}
                  />
                </AnimatedView>

                <AnimatedView delay={100}>
                  <HourlyForecastCard hourly={weather.hourly} />
                </AnimatedView>

                <AnimatedView delay={200}>
                  <DailyForecastCard daily={weather.daily} />
                </AnimatedView>

          <AnimatedView delay={300}>
            <WeatherDetails
              feelsLike={weather.current.feelsLike}
              humidity={weather.current.humidity}
              windSpeed={weather.current.windSpeed}
              windDirection={weather.current.windDirection}
              uvIndex={weather.current.uvIndex}
              pressure={weather.current.pressure}
              visibility={weather.current.visibility}
            />
          </AnimatedView>

          {airQuality && (
            <AnimatedView delay={400}>
              <AirQualityCard data={airQuality} />
            </AnimatedView>
          )}

          {lunarPhase && (
            <AnimatedView delay={500}>
              <LunarPhaseCard data={lunarPhase} />
            </AnimatedView>
          )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>

        <BottomNavBar />

        <CitySelector
          visible={showCitySelector}
          onClose={() => setShowCitySelector(false)}
        />
      </View>
    </DynamicBackground>
  );
}
