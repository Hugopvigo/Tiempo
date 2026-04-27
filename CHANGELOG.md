# Changelog

## Fase 0 — Scaffolding

### Proyecto base
- Proyecto Expo SDK 54 + TypeScript creado con `create-expo-app`
- Expo Router v4 configurado (5 rutas: index, search, tides, map, settings)
- NativeWind v4 + Tailwind CSS preset configurado
- Babel config con Reanimated plugin
- Metro config con NativeWind integration
- TypeScript estricto habilitado con path aliases (`@/*`)

### Dependencias instaladas
| Paquete | Versión | Uso |
|---------|---------|-----|
| expo | ~54.0.33 | Framework base |
| expo-router | ~6.0.23 | Navegación file-based |
| nativewind | ^4.2.3 | Tailwind para RN |
| tailwindcss | ^3.4.19 | Engine CSS |
| zustand | ^5.0.12 | Estado global |
| @tanstack/react-query | ^5.100.1 | Cache de API |
| react-native-mmkv | ^4.3.1 | Almacenamiento key-value |
| react-native-reanimated | ~4.1.1 | Animaciones nativas |
| react-native-worklets | latest | Peer dep de Reanimated |
| lucide-react-native | ^1.9.0 | Iconos |
| react-native-svg | ^15.12.1 | SVG para iconos |
| expo-linear-gradient | ~15.0.8 | Gradientes dinámicos |
| expo-location | ~19.0.8 | Geolocalización |
| expo-notifications | ^0.32.16 | Push notifications |
| react-native-safe-area-context | ~5.6.0 | Safe area |
| react-native-screens | ~4.16.0 | Pantallas nativas |

### Estructura de carpetas
```
tiempo-app/
├── app/                    # Expo Router
├── components/
│   ├── theme/              # ThemeProvider, ThemedText, ThemedCard, DynamicBackground
│   ├── ui/                 # Skeleton, BottomNavBar
│   ├── weather/            # Componentes del tiempo
│   ├── city/               # Componentes de ciudades
│   ├── tides/              # Componentes de mareas (fase 3)
│   └── map/                # Componentes de mapa (fase 5)
├── hooks/                  # Custom hooks
├── services/               # API clients
├── stores/                 # Zustand stores + MMKV persist
├── types/                  # TypeScript types
├── constants/              # Tema, colores, mapeos
└── assets/                 # Iconos, imágenes
```

### Sistema de tema (claro/oscuro)
- `ThemeProvider` con contexto React
- `useTheme()` hook: detecta sistema + override manual
- `ThemedText`: color automático según modo
- `ThemedCard`: fondo semitransparente adaptativo (claro: blanco 25%, oscuro: negro 30%)
- `DynamicBackground`: gradientes duales por condición climática (9 condiciones x 2 modos = 18 gradientes)
- Configuración: `settingsStore.theme` → `'system' | 'light' | 'dark'`

### Servicios API
- `services/openmeteo.ts`: `getWeather()`, `searchCities()`, `getMarineWeather()`
- `services/aemet.ts`: `getAEMETForecast()`, `getAEMETAlerts()`, `getAEMETTides()` (pendiente API key)

### Stores
- `stores/cityStore.ts`: `useCityStore` (ciudades + ciudad activa) + `useSettingsStore` (tema, unidades, notificaciones)
- Persistencia con MMKV

### Hooks
- `useWeather(lat, lon, cityName)` → TanStack Query, stale 10min, cache 30min
- `useTides(lat, lon, isCoastal)` → TanStack Query, stale 30min
- `useCities()` → Zustand store wrapper
- `useAlerts(zonaCode)` → AEMET avisos
- `useLocation()` → expo-location con reverse geocode
- `useTheme()` → sistema + override manual

### Pantallas placeholder
- `app/index.tsx` — Home
- `app/search.tsx` — Búsqueda
- `app/tides.tsx` — Mareas
- `app/map.tsx` — Mapa
- `app/settings.tsx` — Ajustes

### Limpieza
- Eliminados archivos legacy: `index.html`, `script.js`, `style.css`, `Tiempo.py`, subdirectorio `Tiempo/`

---

## Fase 1 — Core: Previsión Actual + 7 días

### Componentes Weather creados

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `WeatherIcon` | `components/weather/WeatherIcon.tsx` | Icono Lucide dinámico por condición (9 condiciones → 9 iconos) |
| `CurrentWeather` | `components/weather/CurrentWeather.tsx` | Ciudad, temperatura 102px, descripción, H/L del día |
| `HourlyForecastCard` | `components/weather/HourlyForecast.tsx` | Scroll horizontal 25h con iconos, temp y % precipitación |
| `DailyForecastCard` | `components/weather/DailyForecast.tsx` | 7 días con icono, % lluvia, temp max/min |
| `WeatherDetails` | `components/weather/WeatherDetails.tsx` | 6 tiles: sensación, humedad, viento, UV, presión, visibilidad |
| `CityHeader` | `components/weather/CityHeader.tsx` | Header navegable a búsqueda |

### UI Components

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `BottomNavBar` | `components/ui/BottomNavBar.tsx` | 5 tabs con Lucide icons + ruta activa destacada |
| Skeleton loaders | `components/ui/Skeleton.tsx` | Shimmer animado (4 variantes: current, hourly, daily, details) |

### Mejoras en servicios
- `openmeteo.ts` ahora rellena `description` e `icon` automáticamente
- Fallback seguro si `currentHourIndex` es -1

### Mejoras en pantalla Home
- Fondo degradado dinámico por condición climática + modo claro/oscuro
- Pull-to-refresh con `RefreshControl`
- Skeleton loaders mientras carga
- Botón "Reintentar" si hay error
- `BottomNavBar` integrada

### Mapeos de condiciones
- `weatherCodeToCondition()`: WMO codes → 9 condiciones normalizadas
- `conditionToDescription`: descripciones en español
- `conditionToIcon`: mapeo a nombres de iconos Lucide
- `windDirectionLabel()`: grados → N/NE/E/SE/S/SO/O/NO
- `formatTemperature()`: soporte °C/°F

---

## Fase 2 — Gestión de Ciudades

### Componentes nuevos

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `CitySelector` | `components/city/CitySelector.tsx` | Modal bottom sheet para cambiar entre ciudades guardadas |
| `SwipeableCityRow` | `components/city/SwipeableCityRow.tsx` | Fila swipe-para-eliminar con PanResponder + Animated |

### Search mejorada
- **Debounce**: 300ms de retardo en búsqueda, evita llamadas API innecesarias
- **Indicador "ya guardada"**: icono Check verde para ciudades ya en la lista
- **Campo de búsqueda**: estilizado con fondo semitransparente
- **Botón GPS**: "Usar mi ubicación" en la parte superior de la pantalla de búsqueda
- **Estado vacío**: mensajes contextuales según longitud de query

### Geolocalización
- **useLocation mejorado**: devuelve objeto `City` con nombre vía `reverseGeocodeAsync`
- **Botón GPS en Settings**: añade ubicación actual como ciudad especial
- **Ciudad GPS**: `id: "gps-current"`, `isLocation: true`, icono MapPin
- **setLocationCity()**: inserta la ciudad GPS al inicio de la lista, elimina GPS previo

### Store mejorado
- `setLocationCity(city)`: añade/actualiza ciudad GPS
- `reorderCities(cities)`: reordenar lista completa
- IDs estables: usa `r.id` de Open-Meteo Geocoding + fallback de coordenadas redondeadas

### Swipe to delete
- `SwipeableCityRow`: PanResponder que detecta swipe izquierda > 20px
- Revela botón rojo de eliminar (80px) con icono Trash2
- Spring animation al soltar (abre si > 50px, cierra si no)
- Alert de confirmación antes de eliminar
- Protección: no se puede eliminar si solo queda 1 ciudad

### Integración en Home
- Tap en nombre de ciudad → abre `CitySelector` modal
- ChevronDown indica que es tappable
- Ciudad GPS muestra "Mi ubicación" en lugar del nombre real

### Integración en Settings
- `SwipeableCityRow` para cada ciudad
- Botón GPS + botón Añadir en header de sección
- Alert de confirmación al eliminar

### plan.md actualizado
- Fase 2 marcada como completada con checkboxes

---

## Fase 3 — Mareas

### Tipos nuevos (`types/weather.ts`)
| Tipo | Descripción |
|------|-------------|
| `MarineData` | Datos marinos horarios + diarios (waveHeight, waveDirection, wavePeriod) |
| `SeaCondition` | Estado del mar actual con label + description |
| `getSeaConditionLabel()` | Altura de ola → etiqueta (Calma, Marejadilla, Marejada, Mar gruesa...) |
| `getSeaConditionDescription()` | Descripción textual del estado del mar |
| `City.isCoastal` | Nuevo campo opcional para marcar ciudades costeras |

### Servicio mejorado (`services/openmeteo.ts`)
- `getMarineWeather()`: parsing tipado completo (snake_case → camelCase)
- `MarineApiResponse` interface interna para tipar respuesta cruda
- Retorna `MarineData` con hourly + daily estructurados

### Hooks (`hooks/useTides.ts`)
| Hook | Descripción |
|------|-------------|
| `useTides(lat, lon, isCoastal)` | TanStack Query, stale 30min, gcTime 60min, retry: 1, enabled solo si coastal |
| `useCurrentSeaCondition(lat, lon, isCoastal)` | Devuelve `SeaCondition` actual (hora más cercana) |

### Detección de ciudad costera (`utils/coastal.ts`)
- `isCoastalCity(city)`: 3 niveles de detección:
  1. `city.isCoastal` explícito
  2. Nombre en lista de ciudades costeras/inland conocidas (40+ ciudades ES)
  3. Haversine a puntos de costa española (< 25km = costera)
- `distanceToNearestCoast()`: calcula km a la costa más cercana
- `haversineKm()`: fórmula Haversine para distancia geodésica

### Componentes nuevos (`components/tides/`)

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `TideChart` | `TideChart.tsx` | Gráfico SVG 24h: curva Bézier suave, área rellena, grid horaria (00/06/12/18/24), etiquetas altura (m), datos max + periodo |
| `TideTable` | `TideTable.tsx` | Tabla 7 días: día, oleaje máx, dirección dominante, periodo máx. Highlight "Hoy" |
| `SeaConditionCard` | `SeaConditionCard.tsx` | Estado del mar actual: label grande (28px), descripción, 3 tiles (altura/dirección/periodo), alerta roja si oleaje ≥ 3m |
| `DaySelector` | (inline en `tides.tsx`) | Tabs de día (Hoy, Lun, Mar...) para seleccionar día del gráfico |
| `index.ts` | Barrel export | Exporta TideChart, TideTable, SeaConditionCard |

### Skeleton loaders nuevos (`components/ui/Skeleton.tsx`)
| Skeleton | Descripción |
|----------|-------------|
| `SeaConditionSkeleton` | Shimmer para card de estado del mar |
| `TideChartSkeleton` | Shimmer para gráfico de mareas |
| `TideTableSkeleton` | Shimmer para tabla 7 días |

### Pantalla Tides reconstruida (`app/tides.tsx`)
- **Ciudad costera**: SeaConditionCard → DaySelector → TideChart → TideTable
- **Ciudad interior**: icono MapPinOff + mensaje + botón "Cambiar ciudad"
- Pull-to-refresh con RefreshControl
- CitySelector integrado (tap en nombre)
- Skeleton loaders mientras carga
- Error state con "Reintentar"
- Adaptación completa claro/oscuro

### plan.md actualizado
- Fases 0, 1 y 3 marcadas como completadas

---

## Fase 4 — Notificaciones y Alertas

### Servicio de alertas locales (`services/alerts.ts`)
- `generateAlerts(weather)`: analiza datos de previsión y genera alertas automáticas
- Umbrales configurados:
  - **Viento**: ≥38 km/h amarillo, ≥50 naranja, ≥70 rojo
  - **UV**: ≥6 amarillo, ≥8 naranja, ≥11 rojo
  - **Tormenta**: WMO codes 95/96/99 → naranja
  - **Lluvia**: precipitación ≥70% amarillo, ≥90% naranja
  - **Nieve**: WMO codes 71-86 → amarillo
  - **Frío**: ≤-5°C amarillo, ≤-10°C naranja
  - **Calor**: ≥38°C naranja, ≥42°C rojo
  - **Niebla**: visibilidad < 1000m → amarillo
- Alertas ordenadas por severidad (rojo → naranja → amarillo)
- IDs estables: `local-{type}-{severity}-{lat}-{lon}`

### Servicio AEMET mejorado (`services/aemet.ts`)
- Parsing tipado completo de avisos AEMET (CAP format)
- `parseAEMETSeverity()`: rojo/naranja/amarillo desde texto AEMET
- `parseAEMETType()`: clasifica tipo de aviso desde texto descriptivo
- Retorna `WeatherAlert[]` tipado
- Fallback silencioso si API key no configurada

### Hook mejorado (`hooks/useAlerts.ts`)
| Hook | Descripción |
|------|-------------|
| `useAlerts(zonaCode)` | AEMET alerts (requiere API key) |
| `useLocalAlerts(weather)` | Alertas generadas localmente desde datos de previsión |

### Componentes nuevos (`components/alerts/`)

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `AlertBanner` | `AlertBanner.tsx` | Banner en Home: color por severidad, título, descripción, contador "+N avisos más", botón dismiss, tap navega a detalle |
| `AlertList` | `AlertBanner.tsx` | Lista completa de alertas con iconos, severidad badge, timestamps |
| `AlertRow` | `AlertBanner.tsx` | Fila individual: emoji + título + horario + badge severidad |
| `index.ts` | Barrel export | Exporta AlertBanner, AlertList |

### Pantalla detalle de alerta (`app/alert-detail.tsx`)
- Header con título + dot de severidad
- Card con descripción completa
- Card con horarios (inicio/fin) + nivel de severidad
- Link a avisos AEMET web
- Adaptación claro/oscuro

### Notificaciones (`services/notifications.ts`)
- `requestNotificationPermissions()`: solicita permisos al usuario
- `scheduleAlertNotification(alert)`: programa notificación con emoji + color
- `cancelAllAlertNotifications()`: limpia todas
- `setBadgeCount(n)`: badge en icono de app
- `setupNotificationChannel()`: canal Android "weather-alerts" (importance HIGH, vibración, luz naranja)
- Handler global configurado con `setNotificationHandler`

### Background fetch (`services/backgroundAlerts.ts`)
- Tarea `background-alerts` registrada con `expo-background-fetch`
- Intervalo: 30 minutos
- `stopOnTerminate: false`, `startOnBoot: true`
- Comprueba hasta 3 ciudades guardadas
- Solo genera notificación para alertas nuevas (deduplicación por ID)
- Respeta preferencias de notificaciones por tipo
- `registerBackgroundFetch()` / `unregisterBackgroundFetch()`

### Tipos ampliados (`types/weather.ts`)
- `AppSettings.notifications`: añadidos `heat`, `cold`, `coastal` (7 tipos totales)

### Store actualizado (`stores/cityStore.ts`)
- Default settings: `heat: true`, `cold: true`, `coastal: false`

### Home screen integrada (`app/index.tsx`)
- `AlertBanner` entre header y CurrentWeather
- Badge count actualizado con `useEffect`
- Setup de notificaciones + background fetch en mount (si enabled)
- Unregister automático si notificaciones deshabilitadas

### Settings ampliado (`app/settings.tsx`)
- Nueva sección "Notificaciones" con:
  - Switch principal "Activar alertas"
  - 7 toggles por tipo: Lluvia, Tormenta, Nieve, Viento, Calor/UV, Frío, Costera
  - Iconos Lucide por tipo
  - Permisos automáticos al activar
  - Background fetch register/unregister

### Layout actualizado (`app/_layout.tsx`)
- Pantalla `alert-detail` registrada en Stack navigator

### Dependencias nuevas
| Paquete | Uso |
|---------|-----|
| expo-task-manager | Definir tareas en background |
| expo-background-fetch | Ejecutar fetch periódico en background |

### plan.md actualizado
- Fase 4 marcada como completada

---

## Fase 5-6 — Mapas y Capas adicionales

### Mapa interactivo (`app/map.tsx`)
- WebView con Leaflet embebido + CartoDB tiles (light_all / dark_all)
- Marcadores de ciudades con divIcons personalizados
- Resolución de capas: precipitación → RainViewer, nubes → satélite/OWM, resto → OWM tiles

### Capas del mapa (`services/weatherLayers.ts`)
- `getRainViewerData()`: API de RainViewer con cache 10min TTL
- `getRadarTileUrl()`: tiles de radar de precipitación
- `getSatelliteTileUrl()`: tiles de satélite infrarrojo
- `getOpenWeatherMapTileUrl()`: V1 tiles (`clouds_new`, `temp_new`, `wind_new`, `pressure_new`)
- `getOpenWeatherMapV2TileUrl()`: V2 tiles (`HRD0` humedad, Maps 2.0 endpoint)

### Hook de capas (`hooks/useWeatherLayers.ts`)
- `useWeatherLayers()`: gestiona RainViewer data + URLs OWM + capas disponibles
- `OWM_LAYER_MAP`: mapa de capas con flag `v2` para endpoint Maps 2.0
- Capas disponibles sin API key: precipitación, nubes
- Capas disponibles con API key: temperatura, viento, humedad, presión

### Selector de capas (`components/map/LayerSelector.tsx`)
- 6 capas: Lluvia, Nubes, Temp, Viento, Humedad, Presión
- Botones horizontales scrollables con iconos Lucide
- Estilo adaptativo claro/oscuro

### Modo oscuro del mapa mejorado
- Opacidad overlay: 0.7 (claro) → 0.85 (oscuro) para mayor visibilidad
- maxZoom ampliado: 13 → 18 para capas OWM
- `errorTileUrl`: GIF transparente 1x1 para tiles fallidos
- Botones de capas con contraste mejorado en dark mode

### Clave API configurable (`app/settings.tsx`)
- Nueva sección "Claves API" con input de OpenWeatherMap API Key
- Muestra clave ofuscada (4 primeros chars + asteriscos)
- Botones Editar/Añadir/Guardar/Cancelar

---

## Fase 7 — Mareas v2: Altura de marea y horarios de pleamar/bajamar

### Datos de marea reales (Open-Meteo Marine API)
- `sea_level_height_msl`: altura del nivel del mar incluyendo mareas, por hora
- Añadido a `getMarineWeather()` en `services/openmeteo.ts`
- `MarineData.hourly.seaLevelHeight`: array numérico con alturas horarias

### Tipos nuevos (`types/weather.ts`)
| Tipo | Descripción |
|------|-------------|
| `TideDirection` | `"rising" \| "falling" \| "stable"` |
| `TideDirectionInfo` | `{ height: number; direction: TideDirection }` |
| `MarineData.hourly.seaLevelHeight` | Altura del nivel del mar por hora |

### Hooks nuevos (`hooks/useTides.ts`)
| Hook/Función | Descripción |
|------|-------------|
| `useTideDirection(lat, lon, isCoastal)` | Devuelve `TideDirectionInfo`: altura actual + dirección (subiendo/bajando/estable) |
| `deriveTideForecasts(seaLevelHeight, times, dates)` | Deriva `TideForecast[]` con horarios de pleamar/bajamar detectando picos/valles locales |

### Componente nuevo: `TideTimesCard` (`components/tides/TideTimesCard.tsx`)
- Muestra horarios de pleamar (↑ verde) y bajamar (↓ naranja) con altura
- Coeficiente de marea estimado
- Aviso de que datos son estimados por modelo numérico
- Estilo adaptativo claro/oscuro

### Componente mejorado: `SeaConditionCard`
- Nueva 4ª columna: indicador de marea con icono TrendingUp/TrendingDown/Minus
- Muestra altura del nivel del mar + dirección (Subiendo/Bajando/Estable)
- Colores: verde subiendo, naranja bajando

### Pantalla Tides actualizada (`app/tides.tsx`)
- `useTideDirection()` para indicador en tiempo real
- `deriveTideForecasts()` para horarios de pleamar/bajamar por día
- `TideTimesCard` integrado entre DaySelector y TideChart
- Cambio de día actualiza tanto TideChart como TideTimesCard

### Versión app
- `app.json` version: `1.0.0` → `2.0.0`

### plan.md actualizado
- Fases 5, 6, 7 marcadas como completadas

---

## v1.0 — Primera Release (Beta)

### EAS Build configurado
- `eas.json` con 3 perfiles: `development`, `preview`, `production`
- Todos los perfiles generan APK para Android
- `appVersionSource: "remote"` — versión gestionada desde EAS
- Proyecto registrado en EAS con ID `9829422f-1608-4ad5-b622-67aecada466f`

### Mapa meteorológico (WebView + Leaflet)
- `WeatherMap` con Leaflet embebido en WebView + CartoDB tiles
- `LayerSelector`: 6 capas (Lluvia, Nubes, Temp, Viento, Humedad, Presión)
- Soporte para RainViewer (radar precipitación), satélite infrarrojo y OpenWeatherMap tiles
- `useWeatherLayers` hook para gestión de URLs y capas
- `weatherLayers.ts`: servicio de capas con cache RainViewer 10min TTL
- Marcadores de ciudades guardadas en el mapa
- Adaptación automática claro/oscuro (CartoDB light_all / dark_all)

### Dependenecias actualizadas
- `.npmrc` con `legacy-peer-deps=true`
- `package-lock.json` actualizado

### Nuevos assets
- Iconos adaptativos actualizados (adaptive-icon, icon, splash-icon, favicon)

---

## v1.1 — Beta 1.1

### Mejoras del mapa
- `WeatherMap` refactorizado con mejor manejo de capas
- Interactividad mejorada en WebView
- Correcciones de estilo y layout

### UI mejorada
- `BottomNavBar` rediseñado con mejor distribución y estilo
- Pantalla Home con mejor layout y espaciado
- Ajustes y búsqueda con micro-mejoras visuales

---

## v2.0 — Release Estable

### Animaciones fluidas y rediseño
- `AnimatedView`: nuevo componente de animaciones con Reanimated
- `ThemedCard` mejorado con soporte para animaciones de entrada
- Gradientes de fondo refinados en `constants/theme.ts`
- `CitySelector` rediseñado con transiciones suaves
- Home screen con layout optimizado y animaciones de entrada

### App icons y splash actualizados
- Iconos de alta resolución (adaptive-icon: 476KB, icon: 476KB)
- Splash icon actualizado
- Favicon actualizado

### UI general
- `BottomNavBar` totalmente rediseñado con nuevos estilos
- `WeatherIcon` con soporte para variante day/night
- `CurrentWeather`, `HourlyForecast`, `DailyForecast` con ajustes visuales
- `ThemedCard` con soporte de animación y blur mejorado
- Modo oscuro refinado en toda la app

### Versión
- `app.json` version: `1.0.0` → `2.0.0`
- `app.json` ampliado con `newArchEnabled`, `edgeToEdgeEnabled`, `predictiveBackGestureEnabled`
- Permisos Android declarados: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`
- Plugins configurados: `expo-router`, `expo-location`, `expo-notifications`

---

## v2.1 — OpenWeatherMaps

### Mapa con capas OWM
- Capas de temperatura, viento, humedad y presión vía OpenWeatherMap
- `getOpenWeatherMapTileUrl()` y `getOpenWeatherMapV2TileUrl()` en `weatherLayers.ts`
- Capas V2: HRD0 (humedad) vía Maps 2.0 endpoint
- Capas disponibles sin API key: precipitación, nubes
- Capas disponibles con API key: temperatura, viento, humedad, presión

### Clave API configurable
- Sección "Claves API" en Settings con input de OpenWeatherMap API Key
- Clave ofuscada en display (4 primeros chars + asteriscos)
- Botones Editar/Añadir/Guardar/Cancelar

---

## v2.2 — Release 2.2

- README.md actualizado con nuevas capturas y descripción

---

## v2.3 — Release 2.3

- Landing page actualizada (index.html)
- README actualizado

---

## v2.4 — Release 2.4

### Estilo de iconos configurable
- Nuevo tipo `IconStyle`: `"colored" | "monochrome"` en `types/weather.ts`
- `AppSettings.iconStyle`: preferencia de iconos del usuario
- `settingsStore` default: `iconStyle: "colored"`
- `WeatherIcon` soporta prop `colored` y lee `settings.iconStyle`
  - **Color**: iconos climáticos con colores por condición (soleado=#FFB800, lluvia=#5AC8FA, tormenta=#7C3AED, etc.)
  - **Monocromo**: iconos en gris adaptativo (como versión anterior)
- `WeatherDetails` iconos con colores temáticos (sensación=#FF6B6B, humedad=#5AC8FA, viento=#34D399, UV=#FFB800, presión=#A78BFA, visibilidad=#60A5FA)
- Sección "Iconos" en Settings con selector Color/Monocromo (iconos Palette + CircleDot)

### Mejoras en mapa
- `useOwmClouds` prop en `WeatherMap`: permite usar tiles OWM para nubes en lugar de satélite
- Opacidad adaptativa por capa: satélite 0.9, OWM 0.7 (claro) / 0.85 (oscuro)
- `maxZoom` dinámico: 13 para satélite, 18 para OWM
- `minZoom` diferenciado: 4 para satélite, 3 para OWM
- `errorTileUrl`: GIF transparente 1x1 para tiles fallidos

### Correcciones
- Botón de ciudad en Settings corregido
- `SwipeableCityRow` con estilo corregido
- Tides: corrección en lógica de mareas
- Modo oscuro: `ThemedCard` y gradientes refinados
- `constants/theme.ts`: colores de fondo ajustados

### Assets
- Nuevas capturas de pantalla: screen-4, screen-5, screen-6
- Capturas existentes actualizadas

### Versión
- `app.json` version: `2.0.0` → `2.4.0`
- `package.json` version: `1.0.0` → `2.4.0`

### EAS Build production
- Build de producción lanzada para Android (APK)

---

## v2.5 — Fase 8: Animaciones de Particulas Climaticas

### Componente nuevo: `WeatherParticles` (`components/theme/WeatherParticles.tsx`)
- Sistema de particulas animadas con Reanimated que se muestran segun la condicion climatica
- 4 tipos de particulas:
  - **Lluvia** (`rain`): 30 gotas cayendo con inclinacion por viento, color azul semitransparente
  - **Tormenta** (`storm`): 40 gotas + flash de relampago periodico (secuencia de opacidad 0.7-0-0.4-0)
  - **Nieve** (`snow`): 24 copos cayendo lentos con drift sinusoidal horizontal, color blanco
  - **Niebla** (`fog`): 6 puffs grandes moviendose horizontalmente con baja opacidad
- Condiciones sin particulas: `clear`, `partly_cloudy`, `cloudy`, `night_clear`, `night_cloudy`

### Arquitectura de particulas
- `RainDrop`: linea vertical animada con `useSharedValue` + `withRepeat(withTiming())` para Y (caida) y opacidad (fade in/out)
- `SnowFlake`: circulo pequeño con animacion Y (caida lenta) + X (drift sinusoidal con `withSequence`)
- `FogPuff`: circulo grande borroso con animacion X (drift horizontal lento)
- `LightningFlash`: overlay full-screen con `withSequence` para flash de relampago, intervalo 4-10s random
- `seededRandom()`: generador pseudo-aleatorio deterministico para posiciones/offsets estables por render
- Todas las particulas usan `pointerEvents="none"` para no bloquear interaccion
- `cancelAnimation()` en `useEffect` cleanup para evitar leaks

### Integracion en Home
- `<WeatherParticles condition={condition} isDark={isDark} />` insertado dentro de `<DynamicBackground>` en `app/index.tsx`
- Capa `position: absolute` entre el fondo degradado y el contenido
- Exportado desde `components/theme/index.ts`

### Colores adaptativos
- Lluvia claro: `rgba(96,165,250,0.35)` / oscuro: `rgba(147,197,253,0.5)`
- Lluvia tormenta claro: `rgba(59,130,246,0.4)` / oscuro: `rgba(147,197,253,0.6)`
- Nieve claro: `rgba(255,255,255,0.85)` / oscuro: `rgba(255,255,255,0.7)`
- Niebla claro: `rgba(203,213,225,0.25)` / oscuro: `rgba(148,163,184,0.12)`
- Relampago: `rgba(255,255,255,0.9)`
