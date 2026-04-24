# Tiempo — App del Tiempo para Android

## Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | **React Native + Expo SDK 52+** | Desarrollo rápido, OTA updates, EAS Build |
| Lenguaje | **TypeScript** | Tipado estricto, menos bugs |
| Navegación | **Expo Router v4** (file-based) | Lazy loading automático, deep linking |
| Estilo | **NativeWind v4** (Tailwind para RN) | CSS utility-first, responsive nativo |
| Estado | **Zustand** + **TanStack Query v5** | Cache inteligente de API, estado mínimo |
| Animaciones | **Reanimated 3** + **Skia** | Animaciones fluidas a 120fps, gráficos custom |
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
- [ ] Crear proyecto con `npx create-expo-app` + template TypeScript
- [ ] Instalar y configurar Expo Router v4
- [ ] Instalar y configurar NativeWind v4
- [ ] Instalar Zustand, TanStack Query, MMKV, Reanimated, Skia, Lucide
- [ ] Crear estructura de carpetas
- [ ] Configurar ThemeProvider (claro/oscuro + sistema)
- [ ] Configurar providers root (QueryClient, Theme, MMKV)
- [ ] Limpiar archivos legacy (HTML, CSS, Python, subdirectorio Tiempo/)
- [ ] Configurar EAS Build para Android
- [ ] Configurar TypeScript estricto

### Fase 1 — Core: Previsión Actual + 7 días
- [ ] Servicio `openmeteo.ts`: función `getWeather(lat, lon)`
- [ ] Servicio `aemet.ts`: función `getWeatherAEMET(codigoMunicipio)`
- [ ] Hook `useWeather(lat, lon)` con TanStack Query (stale 10min, cache 30min)
- [ ] Fallback automático AEMET → Open-Meteo
- [ ] Pantalla principal: fondo degradado dinámico por condición + modo
- [ ] Card tiempo actual (temp, sensación, humedad, viento, UV)
- [ ] Previsión horaria (scroll horizontal, 24h)
- [ ] Previsión diaria (7 días, max/min, icono, prob. lluvia)
- [ ] Skeleton loaders
- [ ] Mapeo condición → icono + gradiente (claro/oscuro)

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
- [ ] Servicio Open-Meteo Marine API
- [ ] Servicio AEMET mareas
- [ ] Hook `useTides(lat, lon)`
- [ ] Gráfico de mareas con Skia (curva sinusoidal)
- [ ] Tabla mareas: hora, altura, tipo (alta/baja), coeficiente
- [ ] Solo visible para ciudades costeras
- [ ] Previsión mareas de la semana
- [ ] Adaptación visual al modo claro/oscuro

### Fase 4 — Notificaciones y Alertas
- [ ] Expo Notifications setup
- [ ] Servicio AEMET Avisos (avisos por zona costera/provincia)
- [ ] Hook `useAlerts(codigoProvincia)`
- [ ] Notificaciones push para avisos AEMET
- [ ] Configuración de umbral por ciudad
- [ ] Background fetch periódico
- [ ] Badge en icono de app
- [ ] Banner de alerta en pantalla principal (color según severidad)
- [ ] Pantalla de detalle de alerta
- [ ] Ajustes de notificaciones por tipo (lluvia, tormenta, nieve, viento)

### Fase 5 — Mapa Meteorológico
- [ ] `@rnmapbox/maps` con Mapbox
- [ ] Capas: radar lluvia, nubes, temperatura, viento
- [ ] Selector de capas (bottom sheet)
- [ ] Animación timeline radar
- [ ] Pins de ciudades guardadas
- [ ] Estilo mapa adaptado a modo claro/oscuro
- [ ] Leyenda interactiva

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

1. **Fase 0**: Scaffolding + cleanup
2. **Fase 1**: Previsión actual + 7 días
3. **Fase 2**: Gestión de ciudades
4. **Fase 3**: Mareas
5. **Fase 4**: Notificaciones/Alertas
6. **Fase 5**: Mapa meteorológico

Cada fase incluye tests de integración y verificación en dispositivo Android.
