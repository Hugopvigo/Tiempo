import { View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useThemeContext, ThemedText } from "@/components/theme";
import { screenBackground } from "@/constants/theme";
import { searchCities } from "@/services/openmeteo";
import { useCities } from "@/hooks/useCities";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Check, Navigation } from "lucide-react-native";
import { useLocation } from "@/hooks/useLocation";
import type { City } from "@/types/weather";

const SearchResultItem = memo(function SearchResultItem({
  city,
  isSaved,
  isDark,
  onSelect,
}: {
  city: City;
  isSaved: boolean;
  isDark: boolean;
  onSelect: (c: City) => void;
}) {
  const iconColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const separator = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <TouchableOpacity
      onPress={() => onSelect(city)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: separator,
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 17, fontWeight: "500" }}>{city.name}</ThemedText>
        <ThemedText secondary style={{ fontSize: 14 }}>
          {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
        </ThemedText>
      </View>
      {isSaved && <Check size={18} color="#4CAF50" />}
    </TouchableOpacity>
  );
});

export default function SearchScreen() {
  const { isDark } = useThemeContext();
  const { cities, addCity, setActiveCity } = useCities();
  const { city: locationCity, loading: locationLoading, requestAndSet } = useLocation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIds = new Set(cities.map((c) => c.id));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debouncedSearch = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (text.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const found = await searchCities(text);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelect = (city: City) => {
    addCity(city);
    setActiveCity(city);
    router.back();
  };

  const handleUseLocation = async () => {
    if (locationCity) {
      addCity(locationCity);
      setActiveCity(locationCity);
      router.back();
    } else {
      await requestAndSet();
    }
  };

  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? screenBackground.dark : screenBackground.light }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={isDark ? "#FFF" : "#000"} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <TextInput
            value={query}
            onChangeText={(t) => { setQuery(t); debouncedSearch(t); }}
            placeholder="Buscar ciudad..."
            placeholderTextColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
            style={{
              flex: 1,
              fontSize: 17,
              paddingVertical: 10,
              color: isDark ? "#FFF" : "#000",
            }}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={iconColor} style={{ marginLeft: 8 }} />}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleUseLocation}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        }}
      >
        <Navigation size={18} color="#2196F3" />
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: "500", color: "#2196F3" }}>
            Usar mi ubicación
          </ThemedText>
          {locationCity && !locationCity.isLocation && (
            <ThemedText secondary style={{ fontSize: 13 }}>{locationCity.name}</ThemedText>
          )}
        </View>
        {locationLoading && <ActivityIndicator size="small" color="#2196F3" />}
      </TouchableOpacity>

      {query.length >= 3 && results.length === 0 && !searching && (
        <View style={{ padding: 32, alignItems: "center" }}>
          <ThemedText secondary style={{ fontSize: 16, textAlign: "center" }}>
            No se encontraron ciudades para "{query}"
          </ThemedText>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        renderItem={({ item }) => (
          <SearchResultItem
            city={item}
            isSaved={savedIds.has(item.id)}
            isDark={isDark}
            onSelect={handleSelect}
          />
        )}
        ListEmptyComponent={
          query.length < 3 ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <ThemedText secondary style={{ fontSize: 15, textAlign: "center" }}>
                Escribe al menos 3 caracteres para buscar
              </ThemedText>
            </View>
          ) : null
        }
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}
