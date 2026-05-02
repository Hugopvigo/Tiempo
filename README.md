# Tiempo — Tu Clima en Tiempo Real - Version 3.2

[![Expo](https://img.shields.io/badge/Expo-54+-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Tiempo** es una aplicacion meteorologica de alto rendimiento para Android, disenada para ofrecer datos precisos con una estetica minimalista inspirada en Apple Weather. Combina datos oficiales de la **AEMET** para Espana con la cobertura global de **Open-Meteo**.

---

## Vista Previa

<div align="center">
  <img src="tiempo-app/assets/screen-1.jpg" width="30%" alt="Screen 1" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-2.jpg" width="30%" alt="Screen 2" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-3.jpg" width="30%" alt="Screen 3" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-4.jpg" width="30%" alt="Screen 1" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-5.jpg" width="30%" alt="Screen 2" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-6.jpg" width="30%" alt="Screen 3" style="border-radius: 20px; margin: 10px;" />
  </div>

---

## Caracteristicas Principales

- **Pronostico Detallado:** Tiempo actual, prevision por horas (24h) y a 7 dias.
- **Calidad del Aire:** Indice EAQI europeo con barra de progreso y detalle expandible (PM2.5, PM10, O3, NO2) via Open-Meteo Air Quality API.
- **Fase Lunar:** 8 fases lunares con SVGs custom, iluminacion %, orto/ocaso lunar y amanecer/atardecer. Calculo local sin API externa.
- **Mareas Dinamicas:** Gráficos sinusoidales con **Skia** para zonas costeras. Deteccion automatica de ciudades costeras vs interiores con datos de la Open-Meteo Marine API. Indicador de marea subiendo/bajando en tiempo real y horarios de pleamar/bajamar.
- **Alertas Oficiales:** Integracion directa con avisos de la AEMET (lluvia, tormenta, nieve, viento, calor, frio, costera). AEMET como fuente principal cuando hay API key configurada, alertas locales como fallback. Merge inteligente sin duplicados.
- **Mapa Interactivo:** Capas de radar de lluvia (RainViewer), satelite infrarrojo de nubes, y capas adicionales de temperatura, viento, humedad y presion via OpenWeatherMap. Opacidad optimizada por capa y filtro CSS para mejorar visibilidad de humedad en modo claro. Animacion de radar en tiempo real con timeline de frames (play/pause/scrub).
- **Widgets:** *(Postpuesto)* Requiere Expo SDK 55+. Widget compacto (2x1) y widget de previsión (4x2) para pantalla de inicio. Se retomará al migrar a Expo 55.
- **Notificaciones Push:** Alertas meteorologicas en segundo plano con configuracion por tipo de alerta. Umbrales ajustados para menos ruido (viento ≥50 km/h, UV ≥8).
- **Interfaz Adaptativa:** Fondos degradados dinamicos que cambian segun la condicion climatica y el modo (claro/oscuro).
- **Gestion de Ciudades:** Busqueda con autocompletado y almacenamiento local ultra rapido con **MMKV**.
- **Geolocalizacion:** Acceso instantaneo al clima de tu ubicacion actual.
- **Claves API configurables:** El usuario puede introducir su propia API Key de OpenWeatherMap y AEMET OpenData desde Ajustes. OWM desbloquea capas adicionales del mapa; AEMET activa alertas oficiales y notificaciones costeras.

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Core** | [Expo SDK 54](https://expo.dev) + React Native |
| **Navegacion** | [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based) |
| **Estilos** | [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS) |
| **Estado** | [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query v5](https://tanstack.com/query/latest) |
| **Animaciones** | [Reanimated 3](https://docs.swmansion.com/react-native-reanimated/) + [Skia](https://shopify.github.io/react-native-skia/) |
| **Persistencia** | [MMKV](https://github.com/mrousavy/react-native-mmkv) |
| **Iconos** | [Lucide React Native](https://lucide.dev) |
| **Mapas** | [Leaflet](https://leafletjs.com/) via WebView + [RainViewer API](https://www.rainviewer.com/api.html) |

---

## Estructura del Proyecto

```text
tiempo-app/
├── app/                  # Rutas de Expo Router (Navegacion)
├── components/           # Componentes atomicos y modulares
│   ├── weather/          # └─ UI de clima (Hourly, Daily, Current)
│   ├── tides/            # └─ Graficos y tablas de mareas
│   ├── map/              # └─ Mapa interactivo (WeatherMap, LayerSelector)
│   ├── city/             # └─ Selector y gestion de ciudades
│   ├── alerts/           # └─ Banners de alertas AEMET
│   ├── theme/            # └─ Proveedores y UI adaptativa
│   └── ui/               # └─ Componentes base (Buttons, Skeletons, BottomNav)
├── hooks/                # Hooks personalizados (Queries, Location, WeatherLayers)
├── services/             # Clientes de API (AEMET, Open-Meteo, RainViewer, OpenWeatherMap)
├── stores/               # Estado global con Zustand + MMKV
├── utils/                # Utilidades (coastal detection, etc.)
└── types/                # Definiciones de TypeScript
```

---

## APIs Utilizadas

| API | Uso | Requiere Key |
|-----|-----|-------------|
| **AEMET API** | Datos oficiales para Espana, avisos meteorologicos | Si (Ajustes app) |
| **Open-Meteo** | Pronostico global, datos marinos (`/v1/marine` con mareas), fallback | No |
| **Open-Meteo Geocoding** | Motor de busqueda de localizaciones y ciudades | No |
| **RainViewer** | Tiles de radar de precipitacion y satelite infrarrojo | No |
| **OpenWeatherMap** | Tiles de temperatura, viento, humedad, presion | Si (Ajustes app) |

---

## Instalacion y Configuracion

Sigue estos pasos para levantar el entorno de desarrollo:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/tiempo.git
cd tiempo/tiempo-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Crea un archivo `.env` en la raiz de `tiempo-app/`:
```env
EXPO_PUBLIC_AEMET_API_KEY=tu_api_key_aqui
```

4. **Ejecutar en Android:**
```bash
npm run android
```

### Configuracion de API Keys en la App

La app permite configurar claves API desde **Ajustes > Claves API** sin necesidad de recompilar:

- **OpenWeatherMap API Key:** Necesaria para desbloquear las capas adicionales del mapa (temperatura, viento, humedad, presion). Sin esta key, solo estaran disponibles las capas de lluvia y nubes (que usan RainViewer, gratuito y sin key).

- **AEMET OpenData API Key:** Activa las alertas oficiales de la AEMET (avisos de lluvia, tormenta, nieve, viento, calor, frio, costera). Cuando esta configurada, las alertas de AEMET reemplazan las locales del mismo tipo como fuente principal. Tambien habilita las notificaciones costeras y el enlace "Ver avisos AEMET" en el detalle de alertas.

Como obtener una API Key gratuita de AEMET:
1. Registrate en [opendata.aemet.es](https://opendata.aemet.es/centrodedescargas/inicio)
2. Solicita una API Key gratuita
3. Copia tu key y pegala en Ajustes > Claves API > AEMET OpenData

Como obtener una API Key gratuita de OpenWeatherMap:
1. Registrate en [openweathermap.org](https://home.openweathermap.org/users/sign_up)
2. Ve a tu perfil > API Keys
3. Copia tu key y pegala en Ajustes > Claves API de la app

---

## Fases de Desarrollo

- [x] **Fase 0:** Scaffolding, TypeScript y NativeWind setup.
- [x] **Fase 1:** Core de prevision (Actual + 7 dias).
- [x] **Fase 2:** Gestion de ciudades y persistencia.
- [x] **Fase 3:** Integracion de Mareas con Skia y Open-Meteo Marine API.
- [x] **Fase 4:** Notificaciones Push y Alertas AEMET.
- [x] **Fase 5:** Mapas meteorologicos interactivos (RainViewer + OpenWeatherMap tiles).
- [x] **Fase 6:** Capas adicionales del mapa (temperatura, viento, humedad, presion) con API Key configurable.
- [x] **Fase 7:** Mareas v2 — Indicador de marea subiendo/bajando, horarios de pleamar/bajamar via sea_level_height_msl.
- [x] **Fase 8:** Animaciones de particulas climaticas en la Home (lluvia, nieve, niebla, relampagos, nubes, destellos solares/estelares con Reanimated). Transicion suave entre condiciones. Correcciones de visibilidad en modo claro.
- [x] **Fase 9:** Animacion de radar en tiempo real (timeline de frames RainViewer).
- [x] **Fase 10:** Widgets de pantalla de inicio — **POSTPUESTO** (requiere Expo SDK 55+, actual en 54).
- [x] **Fase 11:** Calidad del Aire (AQI) — card en Home con Open-Meteo Air Quality API. Índice EAQI europeo con barra de progreso y detalle expandible (PM2.5, PM10, O3, NO2).
- [x] **Fase 12:** Fase Lunar + orto/ocaso lunar — card en Home con 8 SVGs custom (react-native-svg), cálculo local sin API externa.
- [ ] **Fase 13:** Nowcasting — "Lluvia en los proximos 60 min" via analisis de frames RainViewer.
- [ ] **Fase 14:** Swipe horizontal entre ciudades guardadas en Home.
- [ ] **Fase 15:** Internacionalizacion — unidades de distancia (km/mi), presion (hPa/inHg/mmHg) en Ajustes.

---

## Licencia

Este proyecto esta bajo la Licencia MIT. Consulta el archivo [LICENSE](../LICENSE) para mas detalles.

---

Desarrollado con ❤️ por Hugo Perez-Vigo
