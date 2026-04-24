import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/stores/cityStore";
import type { ThemeMode } from "@/types/weather";

export function useTheme() {
  const systemScheme = useColorScheme();
  const { settings } = useSettingsStore();

  const mode: ThemeMode = settings.theme;

  const isDark = useMemo(() => {
    if (mode === "system") return systemScheme === "dark";
    return mode === "dark";
  }, [mode, systemScheme]);

  useEffect(() => {
    if (mode === "system") return;
  }, [mode]);

  return { isDark, mode };
}
