# Tiempo — App del Tiempo para Android

## Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | **React Native + Expo SDK 54** | Desarrollo rápido, OTA updates, EAS Build |
| Lenguaje | **TypeScript** | Tipado estricto, menos bugs |
| Navegación | **Expo Router v6** (file-based) | Lazy loading automático, deep linking |
| Estilo | **NativeWind v4** (Tailwind para RN) | CSS utility-first, responsive nativo |
| Estado | **Zustand** + **TanStack Query v5** | Cache inteligente de API, estado mínimo |
| Animaciones | **Reanimated 4** + **Skia** | Animaciones fluidas a 120fps, gráficos custom |
| Almacenamiento | **MMKV** | Key-value ultra-rápido para ciudades guardadas |
| Iconos | **Lucide** | Consistentes, ligeros |
| APIs | **AEMET** (oficial España) + **Open-Meteo** (fallback/global) | Datos oficiales + cobertura mundial |

## APIs Externas

| API | Datos | Coste |
|-----|-------|-------|
| **AEMET** (aemet.es) | Previsión España, avisos, mareas | Gratuito con key |
| **Open-Meteo** | Previsión global, marine/mareas | Gratuito, sin key |
| **Open-Meteo Geocoding** | Búsqueda de ciudades | Gratuito |
| **AEMET Avisos** | Alertas meteorológicas | Gratuito con key |

## Modo Claro/Oscuro

- Detección automática del sistema (`useColorScheme()`)
- Override manual en Ajustes (sistema / claro / oscuro)
- Fondos degradados duales por condición climática:
  - **Claro**: degradados cálidos (soleado=naranja, lluvia=gris claro, noche=azul cielo)
  - **Oscuro**: degradados profundos (soleado=azul oscuro, lluvia=gris pizarra, noche=negro azulado)
- Cards semitransparentes adaptadas:
  - **Claro**: `rgba(255,255,255,0.25)` con blur
  - **Oscuro**: `rgba(0,0,0,0.3)` con blur
- Texto adaptativo: blanco sobre oscuro, oscuro sobre claro
- Iconos climáticos con variantes day/night
- Transición suave al cambiar modo (Reanimated shared transition)
- Store: `settingsStore` → `{ theme: 'system' | 'light' | 'dark' }`
- NativeWind soporta modo oscuro nativo con `dark:` prefix

## Estructura de Carpetas

```
tiempo-app/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout + providers
│   ├── index.tsx           # Home: previsión actual
│   ├── search.tsx          # Búsqueda de ciudades
│   ├── tides.tsx           # Mareas
│   ├── map.tsx             # Mapa meteorológico
│   └── settings.tsx        # Ajustes + tema + notificaciones
├── components/
│   ├── weather/            # Cards, hourly, daily forecast
│   ├── tides/              # Tide chart, tide table
│   ├── map/                # Map layers, layer selector
│   ├── city/               # City selector, search bar
│   ├── ui/                 # Button, Sheet, Skeleton, etc.
│   └── theme/              # ThemeProvider, ThemedText, etc.
├── hooks/
│   ├── useWeather.ts
│   ├── useTides.ts
│   ├── useCities.ts
│   ├── useAlerts.ts
│   ├── useLocation.ts
│   └── useTheme.ts
├── services/
│   ├── aemet.ts            # AEMET API client
│   ├── openmeteo.ts        # Open-Meteo API client
│   └── geocoding.ts        # City search
├── stores/
│   ├── cityStore.ts        # Zustand: ciudades guardadas
│   └── settingsStore.ts    # Zustand: tema, preferencias, notificaciones
├── types/
│   └── weather.ts          # Tipos compartidos
├── constants/
│   ├── theme.ts            # Colores, gradients por condición + modo
│   └── weather.ts          # Mapeo iconos, descripciones
└── assets/                 # Iconos, imágenes
```

## Fases de Implementación

### Fase 0 — Scaffolding
- [x] Crear proyecto con `npx create-expo-app` + template TypeScript
- [x] Instalar y configurar Expo Router v4
- [x] Instalar y configurar NativeWind v4
- [x] Instalar Zustand, TanStack Query, MMKV, Reanimated, Lucide
- [x] Crear estructura de carpetas
- [x] Configurar ThemeProvider (claro/oscuro + sistema)
- [x] Configurar providers root (QueryClient, Theme, MMKV)
- [x] Limpiar archivos legacy (HTML, CSS, Python, subdirectorio Tiempo/)
- [x] Configurar TypeScript estricto

### Fase 1 — Core: Previsión Actual + 7 días
- [x] Servicio `openmeteo.ts`: función `getWeather(lat, lon)`
- [x] Servicio `aemet.ts`: stub con funciones definidas
- [x] Hook `useWeather(lat, lon)` con TanStack Query (stale 10min, cache 30min)
- [x] Pantalla principal: fondo degradado dinámico por condición + modo
- [x] Card tiempo actual (temp, sensación, humedad, viento, UV)
- [x] Previsión horaria (scroll horizontal, 24h)
- [x] Previsión diaria (7 días, max/min, icono, prob. lluvia)
- [x] Skeleton loaders con shimmer
- [x] Mapeo condición → icono + gradiente (claro/oscuro)
- [x] Pull-to-refresh

### Fase 2 — Gestión de Ciudades
- [x] Servicio `geocoding.ts`: búsqueda con Open-Meteo Geocoding
- [x] Store `cityStore.ts`: ciudades guardadas, ciudad activa
- [x] Persistencia con MMKV
- [x] Pantalla de búsqueda con autocompletado + debounce
- [x] Lista de ciudades guardadas
- [x] Ciudad por defecto = última seleccionada
- [x] Geolocalización actual como primera ciudad (GPS)
- [x] Swipe para eliminar
- [x] Bottom sheet selector de ciudades (CitySelector modal)
- [x] Transición animada al cambiar ciudad

### Fase 3 — Mareas
- [x] Servicio Open-Meteo Marine API (tipado fuerte, snake→camelCase)
- [x] Hook `useTides(lat, lon)` + `useCurrentSeaCondition(lat, lon)`
- [x] Gráfico de mareas con SVG (curva Bézier 24h, fill + grid)
- [x] Tabla mareas 7 días: oleaje, dirección, periodo
- [x] Detección automática de ciudad costera (`isCoastalCity()`)
- [x] Card estado del mar actual (altura, dirección, periodo, alerta)
- [x] Selector de día (tabs: Hoy, Lun, Mar...)
- [x] Pantalla "ciudad interior" cuando no es costera
- [x] Skeleton loaders para mareas
- [x] Adaptación visual al modo claro/oscuro
- [ ] Servicio AEMET mareas (pendiente API key)

### Fase 4 — Notificaciones y Alertas
- [x] Alertas locales generadas desde datos de previsión (viento, UV, tormenta, lluvia, nieve, frío, calor, niebla)
- [x] Servicio AEMET Avisos (parsing tipado, fallback si no hay key)
- [x] Hook `useLocalAlerts(weather)` + `useAlerts(zonaCode)`
- [x] AlertBanner en pantalla principal (color por severidad, dismiss, navegación a detalle)
- [x] AlertList + AlertRow (lista de avisos con icono, severidad, timestamps)
- [x] Pantalla detalle de alerta (título, descripción, inicio/fin, severidad, link AEMET condicional)
- [x] Expo Notifications setup + permisos + canal Android
- [x] Background fetch periódico (30min) para alertas
- [x] Badge en icono de app (número de alertas activas)
- [x] Ajustes de notificaciones por tipo (lluvia, tormenta, nieve, viento, calor, frío, costera)
- [x] `AppSettings.notifications` ampliado con heat/cold/coastal
- [x] Umbrales ajustados: viento 50/65/90, UV 8/10/12, temp 40/44, lluvia red ≥95%, frío red ≤-20°C
- [x] Integración AEMET: API key configurable en Settings, init en _layout.tsx
- [x] Mapa admin1 → zona AEMET (`constants/aemetZones.ts` + `getAEMETZone()`)
- [x] Hook combinado `useMergedAlerts()`: AEMET principal, locales fallback/complemento
- [x] Background fetch con merge AEMET+locales
- [x] 8 bugs corregidos: badge count, Cantabria→SAN, ID AEMET determinista, fallback null, toggle costera con nota, rain.red, calor descripción, cold.red

### Fase 5 — Mapa Meteorológico
- [x] Mapa WebView con Leaflet + CartoDB tiles (light_all / dark_all)
- [x] Capas: radar lluvia (RainViewer), nubes (satélite/OWM), temperatura, viento, humedad, presión
- [x] Selector de capas (`LayerSelector`) con 6 botones horizontales
- [x] Marcadores de ciudades guardadas con divIcons personalizados
- [x] Estilo mapa adaptado a modo claro/oscuro
- [x] Clave API OpenWeatherMap configurable desde Settings
- [x] Capas OWM V1 (humedad_m) — humedad migrada de V2 HRD0 a V1 humidity_m
- [x] `useOwmClouds` alternancia entre satélite y tiles OWM para nubes
- [x] Opacidad por capa (nubes 0.85, viento 0.8, humedad 0.85 en modo claro)
- [x] Filtro CSS `brightness(0.65) saturate(1.5)` en pane overlay para humedad en modo claro
- [x] `errorTileUrl` para tiles fallidos

### Fase 6 — Capas adicionales OWM
- [x] Capas de temperatura, viento, humedad y presion via OpenWeatherMap
- [x] Seccion "Claves API" en Settings con input de OpenWeatherMap API Key
- [x] Capas V1 (humidity_m para humedad) — todas las capas usan API V1
- [x] Capas disponibles sin API key: precipitacion, nubes
- [x] Capas disponibles con API key: temperatura, viento, humedad, presion

### Fase 7 — Mareas v2
- [x] `sea_level_height_msl` integrado en `getMarineWeather()`
- [x] `useTideDirection()`: altura actual + direccion (subiendo/bajando/estable)
- [x] `deriveTideForecasts()`: horarios de pleamar/bajamar detectando picos/valles
- [x] `TideTimesCard`: pleamar (verde) / bajamar (naranja) con alturas
- [x] Indicador de marea en `SeaConditionCard` (4a columna)

### Fase 8 — Animaciones de Particulas Climaticas
- [x] Componente `WeatherParticles` con Reanimated (`useSharedValue` + `withRepeat`)
- [x] `RainDrop`: 20 gotas cayendo con inclinacion por viento (rain), 28 gotas (storm)
- [x] `SnowFlake`: 16 copos con drift sinusoidal horizontal
- [x] `FogPuff`: 5 puffs grandes con drift horizontal lento
- [x] `CloudPuff`: 2-3 nubes lentas para partly_cloudy/cloudy/night_cloudy
- [x] `Sparkle`: 6-10 puntitos pulsantes para clear/night_clear
- [x] `LightningFlash`: overlay con flash periodico (storm), primer flash inmediato
- [x] `seededRandom()`: offsets deterministas por render
- [x] Colores adaptativos claro/oscuro por tipo de particula
- [x] `pointerEvents="none"` + `cancelAnimation()` en cleanup
- [x] Transicion fade in/out al cambiar de condicion climatica
- [x] Visibilidad mejorada de nieve, niebla y lluvia en modo claro
- [x] Bugfix: `runOnJS` innecesario eliminado de LightningFlash

### Fase 9 — Animacion de Radar en Tiempo Real
- [x] `useWeatherLayers` ampliado: `isPlaying`, `togglePlay`, `stopPlay`, `radarFrameUrls`, `pastCount`
- [x] Auto-play con interval 800ms, ciclo frames past+nowcast
- [x] `RadarTimeline` componente: play/pause, skip-back, slider, etiqueta hora + indicador pasado/prediccion
- [x] Slider con `@react-native-community/slider` para scrub manual de frames
- [x] Animacion ejecutada en WebView (Leaflet) via `injectRadarAnimation()` — loop nativo JS sin bridge
- [x] `injectRadarPause()` + `injectRadarFrame()` para pausa y seleccion manual
- [x] Separacion visual pasado (azul) vs prediccion (naranja) en timeline
- [x] Comunicacion WebView→RN: `frameChange` message para sincronizar indice
- [x] Timeline visible solo en capa precipitation
- [x] Al cambiar capa no-radar, auto-stop de animacion
- [x] `LayerSelector` recibe `showRadarTimeline` prop para ajustar posicion

### Fase 10 — Widgets de Pantalla de Inicio *(POSTPUESTO — requiere Expo SDK 55+, actual en 54)*
- [ ] Widget pequeno (2x1): ciudad + temperatura + condicion + max/min
- [ ] Widget mediano (4x2): ciudad + temperatura + condicion + prevision 4 dias
- [ ] Layouts XML: `widget_weather_small.xml`, `widget_weather_medium.xml`
- [ ] Backgrounds adaptativos claro/oscuro: `widget_bg_dark.xml`, `widget_bg_light.xml`
- [ ] `WeatherWidgetProvider` (Kotlin): lee datos de SharedPreferences, actualiza RemoteViews
- [ ] `WeatherWidgetMediumProvider` (Kotlin): extiende provider para widget mediano
- [ ] Modulo nativo Expo `tiempo-widget`: `TiempoWidgetModule` escribe en SharedPreferences + broadcast
- [ ] Hook `useWidgetUpdater`: escribe datos del clima en widget cada 5 min (debounce)
- [ ] Integracion en Home: `useWidgetUpdater(cityName, weather)`
- [ ] Declaracion en AndroidManifest.xml con APPWIDGET_UPDATE + custom broadcast
- [ ] `widget_weather_small_info.xml` + `widget_weather_medium_info.xml` (AppWidgetProviderInfo)
- [ ] Auto-update cada 30 min via `updatePeriodMillis`
- [ ] Click en widget abre la app (PendingIntent → MainActivity)
- [ ] Colores de texto adaptativos segun modo del sistema (isDarkMode)
> **NOTA:** `expo-widgets` y `@expo/ui` (que incluye `ComposeViewFunctionDefinitionBuilder`) requieren Expo 55.
> La app usa Expo 54, por lo que la integracion crashea con `ClassNotFoundException`.
> Se retomara esta fase al migrar a Expo SDK 55.

## Version Actual

**v3.3** — Integración AEMET + Corrección de Alertas:
- Previsión actual + 7 días (Open-Meteo + AEMET)
- Gestión de ciudades con GPS y swipe-to-delete
- Mareas con gráfico SVG, tabla 7 días, estado del mar, horarios de pleamar/bajamar
- **Alertas oficiales AEMET** integradas: API key configurable, AEMET como fuente principal, locales como fallback/complemento. Merge inteligente sin duplicados.
- Umbrales ajustados (menos ruido): viento 50/65/90, UV 8/10/12, temp 40/44
- Mapa meteorológico interactivo con 6 capas (RainViewer, satélite, OWM) — opacidad por capa y filtro CSS para humedad en modo claro
- Animación de radar en tiempo real con timeline de frames (play/pause/scrub)
- Calidad del Aire (AQI europeo) con detalle expandible (PM2.5, PM10, O3, NO2)
- Fase Lunar con SVGs custom + orto/ocaso lunar + amanecer/atardecer
- *(Widgets postpuesto — requiere Expo 55)*
- Estilo de iconos configurable (color/monocromo)
- Animaciones de partículas climáticas (lluvia, nieve, niebla, relámpagos, nubes, destellos solares/estelares) con transición suave y visibilidad mejorada en modo claro
- Modo claro/oscuro con gradientes dinámicos
- EAS Build configurado (development, preview, production — APK)
- 8 bugs de notificaciones corregidos (badge, Cantabria, ID AEMET, fallback, costera, rain.red, calor, cold.red)

## Principios de Diseño (estilo Apple Weather)

- **Fondo dinámico**: Gradiente que cambia según condición + modo (claro/oscuro)
- **Tipografía grande**: Temps en font-size 96+, peso light
- **Cards semitransparentes**: glassmorphism sutil con blur backdrop
  - Claro: `rgba(255,255,255,0.25)`
  - Oscuro: `rgba(0,0,0,0.3)`
- **Scroll vertical único**: Todo en una columna, sin tabs inferiores
- **Animaciones sutiles**: Transiciones con Reanimated, parallax en scroll
- **Zero bordes**: Esquinas redondeadas, sin líneas separadoras
- **Consistencia de tema**: Todo componente responde al modo activo

## Paleta de Gradientes por Condición

### Modo Claro
| Condición | Gradiente |
|-----------|-----------|
| Soleado | `#FF9500` → `#FFCC00` |
| Parcialmente nublado | `#5AC8FA` → `#B2EBF2` |
| Nublado | `#8E8E93` → `#C7C7CC` |
| Lluvia | `#546E7A` → `#90A4AE` |
| Tormenta | `#37474F` → `#607D8B` |
| Nieve | `#E0E0E0` → `#F5F5F5` |
| Noche despejada | `#0D1B2A` → `#1B2838` |
| Noche nublada | `#1A1A2E` → `#2D2D44` |

### Modo Oscuro
| Condición | Gradiente |
|-----------|-----------|
| Soleado | `#1A237E` → `#283593` |
| Parcialmente nublado | `#1A2940` → `#2C3E50` |
| Nublado | `#1C1C1E` → `#2C2C2E` |
| Lluvia | `#0D1117` → `#1B2838` |
| Tormenta | `#0A0A0A` → `#1A1A2E` |
| Nieve | `#1C1C1E` → `#3A3A3C` |
| Noche despejada | `#000000` → `#0D1B2A` |
| Noche nublada | `#0A0A0A` → `#1A1A2E` |

## Estrategia de Rendimiento

- **Splash screen** → datos cacheados al instante (TanStack Query cache + MMKV)
- **Lazy loading** de pantallas con Expo Router
- **Reanimated** para animaciones en thread de UI (no JS bridge)
- **Memoización** agresiva de componentes de lista (`React.memo` + `useMemo`)
- **Iconos SVG vectoriales** (no PNGs)
- **Bundle splitting** automático por ruta
- **Stale-while-revalidate**: mostrar cache mientras se revalida en background
- **MMKV** para lecturas síncronas instantáneas (0ms vs AsyncStorage ~5ms)
- **Hermes engine** habilitado (default en Expo): bytecode precompilado

## Orden de Ejecución

1. **Fase 0**: Scaffolding + cleanup ✅
2. **Fase 1**: Previsión actual + 7 días ✅
3. **Fase 2**: Gestión de ciudades ✅
4. **Fase 3**: Mareas ✅
5. **Fase 4**: Notificaciones/Alertas ✅
6. **Fase 5**: Mapa meteorológico ✅
7. **Fase 6**: Capas adicionales OWM ✅
8. **Fase 7**: Mareas v2 (pleamar/bajamar) ✅
9. **Fase 8**: Animaciones de particulas climaticas ✅
10. **Fase 9**: Animacion de radar en tiempo real (timeline RainViewer) ✅
11. **Fase 10**: Widgets de pantalla de inicio *(postpuesto — requiere Expo 55)*
12. **Fase 11**: Calidad del Aire (AQI) — card en Home
13. **Fase 12**: Fase Lunar + orto/ocaso lunar — card en Home
14. **Fase 13**: Nowcasting — "Lluvia en los próximos 60 min"
15. **Fase 14**: Swipe horizontal entre ciudades en Home
16. **Fase 15**: Internacionalización — unidades de distancia (km/mi), presión, más

Cada fase incluye verificación en dispositivo Android vía EAS Build.

---

## Fases Futuras (Plan Detallado)

### Fase 11 — Calidad del Aire (AQI)
- [x] Tipos `AirQualityData` + helpers `getAQILabel/getAQIDescription/getAQIColor` en `types/weather.ts`
- [x] Servicio `getAirQuality(lat, lon)` en `services/openmeteo.ts` → Open-Meteo `/v1/air-quality`
- [x] Parametros: `pm2_5`, `pm10`, `ozone`, `nitrogen_dioxide`, `european_aqi`
- [x] Hook `useAirQuality(lat, lon)` con TanStack Query (stale 30min, gcTime 60min, retry 1)
- [x] Componente `AirQualityCard`: AQI europeo con color semaforo EAQI (0-20 bueno, 20-40 moderado, 40-60 deficiente, 60-80 malo, 80-100 muy malo, >100 extremo)
- [x] Barra de progreso horizontal con gradiente EAQI y marcador
- [x] Detalle expandible (tap): PM2.5, PM10, O3, NO2 con barras de progreso
- [x] Integracion en Home como nueva card debajo de `WeatherDetails` (delay 400)
- [x] Adaptacion visual modo claro/oscuro + iconos colored/monochrome
- [x] API gratuita y sin key — sin configuracion extra

### Fase 12 — Fase Lunar + Orto/Ocaso Lunar
- [x] Calculo local con algoritmo lunar (sin API externa) en `utils/lunar.ts`
- [x] `calculateMoonPhase(date)`: edad lunar, fase (8 fases), iluminacion %
- [x] `calculateMoonTimes(date, lat, lon)`: orto/ocaso lunar aproximado
- [x] Hook `useLunarPhase(lat, lon, daily)` con `useMemo` (sin query API)
- [x] Tipo `LunarPhaseData` en `types/weather.ts`
- [x] Componente `MoonPhaseCard`: 8 SVGs custom con `react-native-svg`
- [x] Fases lunares: Luna nueva, Creciente, Cuarto creciente, Gibosa creciente, Luna llena, Gibosa menguante, Cuarto menguante, Menguante
- [x] Amanecer/Atardecer con iconos Sunrise/Sunset (lucide)
- [x] Orto/Ocaso lunar con iconos Moon (lucide)
- [x] Integracion en Home debajo de AirQualityCard (delay 500)
- [x] Adaptacion visual modo claro/oscuro + iconos colored/monochrome

### Fase 13 — Nowcasting: "Lluvia en los próximos 60 min"
- [ ] Analisis de frames RainViewer para inferir precipitacion acercandose
- [ ] Algoritmo: comparar intensidad de radar en frames sucesivos alrededor de la ubicacion
- [ ] Componente `NowcastingBanner`: "Empieza a llover en ~15 min" / "Lluvia disminuyendo"
- [ ] Banner contextual en Home (debajo de ciudad, arriba de alerts)
- [ ] Notificacion tipo DarkSky: alerta proactiva de lluvia inminente
- [ ] Configurable en ajustes de notificaciones (toggle "Nowcasting")
- [ ] Solo activo cuando hay datos de radar disponibles y GPS activo

### Fase 14 — Swipe Horizontal entre Ciudades en Home
- [ ] `FlatList` horizontal con `pagingEnabled` envolviendo el contenido de Home
- [ ] Cada "pagina" = la Home completa para una ciudad guardada
- [ ] Indicador de puntos (dots) en la parte inferior mostrando ciudad activa
- [ ] Transicion suave entre ciudades con `Animated` o Reanimated
- [ ] Cambio de ciudad en store al hacer swipe
- [ ] Los datos del clima se cargan con `useWeather` por cada ciudad (pre-caching con TanStack Query)
- [ ] Optimizacion: precargar datos de ciudades adyacentes en background
- [ ] Solo en Home — resto de pantallas usan ciudad activa normal

### Fase 15 — Internacionalización: Unidades Adicionales
- [ ] `AppSettings` ampliado: `distanceUnit: "km" | "mi"`, `pressureUnit: "hPa" | "inHg" | "mmHg"`
- [ ] Seccion "Unidades" ampliada en Settings con todos los selectores
- [ ] Distancia: km (metrico) vs mi (imperial) — afecta visibilidad
- [ ] Presion: hPa (default) vs inHg (imperial) vs mmHg
- [ ] Velocidad del viento: ya tiene kmh/mph/ms/knots — mantener
- [ ] Temperatura: ya tiene celsius/fahrenheit — mantener
- [ ] Funciones helper: `formatDistance()`, `formatPressure()` en `utils/units.ts`
- [ ] Aplicar formato en `WeatherDetails` y `AirQualityCard`
- [ ] Widget respeta unidades configuradas

### Seguridad — Hardening v3.0
- [x] Eliminados `react-native-windows` (4 HIGH CVEs), `@types/react-native` (deprecated), `react-native-web` (innecesaria como dep directa)
- [x] AndroidManifest: eliminados permisos peligrosos (`SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE`), `allowBackup=false`
- [x] WeatherMap WebView: SRI hashes en Leaflet CDN, `originWhitelist` restringido, `sanitizeUrl()` para URLs inyectadas; `data:image/*` único esquema `data:` permitido
- [x] AEMET: `res.ok` en segundo fetch (`data.datos`) — errores HTTP ya no se parsean como datos válidos
- [x] Search: `AbortController` en `search.tsx` + `signal` en `searchCities()` — race condition fix
- [x] `react-native-worklets` 0.5.1 → 0.8.1 (requerido por reanimated 4.3.0)
- [x] Deps actualizadas dentro de SDK 54 (expo, metro-config, linking, notifications, tanstack, lucide, svg, nitro-modules, slider, safe-area, reanimated, screens)
- [x] Vulnerabilidades: 24 → 13 (0 HIGH, 13 moderate transitivos de Expo SDK 54)

### Calidad v3.0 — Bugs, Rendimiento y Animaciones
- [x] `formatTemperature()` aplicado en CurrentWeather, HourlyForecast, DailyForecast, WeatherDetails, WeatherMap; `formatWind()` en WeatherDetails
- [x] GPS stale closure: `requestAndSet` devuelve `City | null` en settings y search
- [x] AlertBanner: `dismissRef` (RN no tiene event bubbling)
- [x] HourlyForecast: horas parseadas del string ISO (fix timezone del dispositivo)
- [x] WeatherMap `html` en `useMemo` sin deps de animación — WebView no se destruye por cada frame de radar
- [x] ThemeProvider `useMemo`; ThemedCard/ThemedText `StyleSheet.create`; HourlyForecast `ScrollView` → `FlatList`; TideChart SVG en `useMemo`
- [x] SwipeableCityRow y Skeleton migrados a Reanimated + GestureHandler (UI thread)
- [x] WeatherParticles: contadores reducidos (lluvia 30→20, tormenta 40→28, nieve 24→16)
- [x] Eliminados `Original.png` (2,2 MB) + `assets/Old/` (464 KB); no-op `useEffect` en `useTheme`
