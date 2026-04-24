import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DynamicBackground, ThemedText, ThemedCard, useThemeContext } from "@/components/theme";
import { useTides } from "@/hooks/useTides";
import { useCities } from "@/hooks/useCities";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { Waves } from "lucide-react-native";

export default function TidesScreen() {
  const { isDark } = useThemeContext();
  const { activeCity } = useCities();
  const { data, isLoading } = useTides(activeCity.lat, activeCity.lon, true);

  return (
    <DynamicBackground condition="clear">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: "center", paddingTop: 20, marginBottom: 24 }}>
            <Waves size={48} color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"} />
            <ThemedText style={{ fontSize: 34, fontWeight: "600", marginTop: 12 }}>
              Mareas
            </ThemedText>
            <ThemedText secondary style={{ fontSize: 18 }}>
              {activeCity.name}
            </ThemedText>
          </View>

          {isLoading && (
            <ThemedCard>
              <ThemedText secondary>Cargando datos de mareas...</ThemedText>
            </ThemedCard>
          )}

          {data && (
            <ThemedCard>
              <ThemedText
                secondary
                style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12, letterSpacing: 0.5 }}
              >
                Estado del mar
              </ThemedText>
              <ThemedText>Datos de mareas disponibles próximamente</ThemedText>
            </ThemedCard>
          )}

          {!isLoading && !data && (
            <ThemedCard>
              <ThemedText secondary style={{ textAlign: "center" }}>
                Los datos de mareas no están disponibles para esta ubicación. Prueba con una ciudad costera.
              </ThemedText>
            </ThemedCard>
          )}
        </ScrollView>

        <BottomNavBar />
      </SafeAreaView>
    </DynamicBackground>
  );
}
