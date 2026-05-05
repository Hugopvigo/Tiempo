import { View, ScrollView, RefreshControl , TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DynamicBackground, ThemedText, useThemeContext } from "@/components/theme";
import { TideChart, TideTable, SeaConditionCard, TideTimesCard } from "@/components/tides";
import { SeaConditionSkeleton, TideChartSkeleton, TideTableSkeleton } from "@/components/ui/Skeleton";
import { useTides, useCurrentSeaCondition, useTideDirection, deriveTideForecasts } from "@/hooks/useTides";
import { useCities } from "@/hooks/useCities";
import { isCoastalCity } from "@/utils/coastal";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { CitySelector } from "@/components/city";
import { useState, useMemo } from "react";
import { ChevronDown, Waves, MapPinOff } from "lucide-react-native";
import type { MarineData, TideForecast } from "@/types/weather";

export default function TidesScreen() {
  const { isDark } = useThemeContext();
  const { activeCity } = useCities();
  const coastal = isCoastalCity(activeCity);
  const { data, isLoading, error, refetch, isRefetching } = useTides(
    activeCity.lat,
    activeCity.lon,
    coastal
  );
  const seaCondition = useCurrentSeaCondition(data);
  const tideDirection = useTideDirection(data);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  const tideForecasts = useMemo<TideForecast[]>(() => {
    if (!data) return [];
    return deriveTideForecasts(
      data.hourly.seaLevelHeight,
      data.hourly.time,
      data.daily.date
    );
  }, [data]);

  if (!coastal) {
    return (
      <DynamicBackground condition="clear">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
          >
            <TouchableOpacity
              onPress={() => setShowCitySelector(true)}
              activeOpacity={0.6}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 8,
                paddingBottom: 4,
                gap: 4,
              }}
            >
              <ThemedText style={{ fontSize: 22, fontWeight: "600" }}>
                {activeCity.name}
              </ThemedText>
              <ChevronDown size={18} color={iconColor} />
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <MapPinOff
                size={48}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
              />
              <ThemedText
                style={{ fontSize: 20, fontWeight: "600", marginTop: 16 }}
              >
                Ciudad interior
              </ThemedText>
              <ThemedText
                secondary
                style={{
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                  maxWidth: 280,
                  lineHeight: 20,
                }}
              >
                Los datos de mareas no están disponibles para {activeCity.name}.
                Selecciona una ciudad costera para ver el estado del mar.
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowCitySelector(true)}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.08)",
                  borderRadius: 20,
                }}
              >
                <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>
                  Cambiar ciudad
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <BottomNavBar />
          <CitySelector
            visible={showCitySelector}
            onClose={() => setShowCitySelector(false)}
          />
        </SafeAreaView>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground condition="clear">
      <SafeAreaView style={{ flex: 1 }}>
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
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 8,
              paddingBottom: 4,
              gap: 4,
            }}
          >
            <Waves
              size={16}
              color={isDark ? "#5AC8FA" : "#007AFF"}
            />
            <ThemedText style={{ fontSize: 22, fontWeight: "600" }}>
              {activeCity.name}
            </ThemedText>
            <ChevronDown size={18} color={iconColor} />
          </TouchableOpacity>

          {isLoading && (
<View style={{ gap: 16, marginTop: 12 }}>
        <SeaConditionSkeleton />
              <TideChartSkeleton />
              <TideTableSkeleton />
            </View>
          )}

          {error && (
            <View style={{ alignItems: "center", marginTop: 40, minHeight: 200 }}>
              <ThemedText secondary style={{ fontSize: 16, textAlign: "center" }}>
                No se pudieron cargar los datos de mareas
              </ThemedText>
              <ThemedText
                secondary
                style={{
                  fontSize: 14,
                  marginTop: 8,
                  textDecorationLine: "underline",
                }}
                onPress={() => refetch()}
              >
                Reintentar
              </ThemedText>
            </View>
          )}

      {data && seaCondition && (
        <View style={{ gap: 16, marginTop: 12 }}>
          <SeaConditionCard condition={seaCondition} tideDirection={tideDirection} />

          <DaySelector
            data={data}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />

          {tideForecasts.length > 0 && (
            <TideTimesCard forecast={tideForecasts[selectedDay] ?? tideForecasts[0]} />
          )}

          <TideChart data={data} dayIndex={selectedDay} />

          <TideTable data={data} />
        </View>
      )}
        </ScrollView>

        <BottomNavBar />

        <CitySelector
          visible={showCitySelector}
          onClose={() => setShowCitySelector(false)}
        />
      </SafeAreaView>
    </DynamicBackground>
  );
}

function DaySelector({
  data,
  selectedDay,
  onSelect,
}: {
  data: MarineData;
  selectedDay: number;
  onSelect: (i: number) => void;
}) {
  const { isDark } = useThemeContext();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 6,
        marginBottom: 2,
      }}
    >
      {data.daily.date.map((date, i) => {
        const d = new Date(date + "T12:00");
        const label =
          i === 0
            ? "Hoy"
            : d.toLocaleDateString("es-ES", { weekday: "short" });
        const isToday =
          new Date(date).toDateString() === new Date().toDateString();
        const active = i === selectedDay;

        return (
          <TouchableOpacity
            key={date}
            onPress={() => onSelect(i)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: active
                ? isDark
                  ? "rgba(90,200,250,0.2)"
                  : "rgba(0,122,255,0.12)"
                : "transparent",
            }}
          >
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: active ? "600" : "400",
                color: active
                  ? isDark
                    ? "#5AC8FA"
                    : "#007AFF"
                  : isDark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.45)",
              }}
            >
              {label}
            </ThemedText>
            {isToday && !active && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.2)",
                  marginTop: 3,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
