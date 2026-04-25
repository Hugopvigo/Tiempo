# 🌦️ Tiempo — Tu Clima en Tiempo Real  - Version 2.0

[![Expo](https://img.shields.io/badge/Expo-54+-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Tiempo** es una aplicación meteorológica de alto rendimiento para Android, diseñada para ofrecer datos precisos con una estética minimalista inspirada en Apple Weather. Combina datos oficiales de la **AEMET** para España con la cobertura global de **Open-Meteo**.

---

## 📱 Vista Previa

<div align="center">
  <img src="tiempo-app/assets/screen-1.jpg" width="280" alt="Screen 1" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-2.jpg" width="280" alt="Screen 2" style="border-radius: 20px; margin: 10px;" />
  <img src="tiempo-app/assets/screen-3.jpg" width="280" alt="Screen 3" style="border-radius: 20px; margin: 10px;" />
</div>

---

## ✨ Características Principales

- 🌡️ **Pronóstico Detallado:** Tiempo actual, previsión por horas (24h) y a 7 días.
- 🌊 **Mareas Dinámicas:** Gráficos sinusoidales con **Skia** para zonas costeras.
- 🚨 **Alertas Oficiales:** Integración directa con avisos de la AEMET.
- 🗺️ **Mapa Interactivo:** Capas de lluvia, viento y temperatura.
- 🎨 **Interfaz Adaptativa:** Fondos degradados dinámicos que cambian según la condición climática y el modo (claro/oscuro).
- 🏙️ **Gestión de Ciudades:** Búsqueda con autocompletado y almacenamiento local ultra rápido con **MMKV**.
- 📍 **Geolocalización:** Acceso instantáneo al clima de tu ubicación actual.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Core** | [Expo SDK 54](https://expo.dev) + React Native |
| **Navegación** | [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based) |
| **Estilos** | [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS) |
| **Estado** | [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query v5](https://tanstack.com/query/latest) |
| **Animaciones** | [Reanimated 3](https://docs.swmansion.com/react-native-reanimated/) + [Skia](https://shopify.github.io/react-native-skia/) |
| **Persistencia** | [MMKV](https://github.com/mrousavy/react-native-mmkv) |
| **Iconos** | [Lucide React Native](https://lucide.dev) |

---

## 🏗️ Estructura del Proyecto

```text
tiempo-app/
├── app/                # 📂 Rutas de Expo Router (Navegación)
├── components/         # 🧩 Componentes atómicos y modulares
│   ├── weather/        #   └─ UI de clima (Hourly, Daily, Current)
│   ├── tides/          #   └─ Gráficos y tablas de mareas
│   ├── theme/          #   └─ Proveedores y UI adaptativa
│   └── ui/             #   └─ Componentes base (Buttons, Skeletons)
├── hooks/              # ⚓ Hooks personalizados (Queries, Location, Theme)
├── services/           # 🔌 Clientes de API (AEMET, Open-Meteo)
├── stores/             # 📦 Estado global con Zustand
└── types/              # 🏷️ Definiciones de TypeScript
```

---

## 🔌 APIs Utilizadas

- **AEMET API:** Datos oficiales para España, avisos meteorológicos y mareas costeras.
- **Open-Meteo:** Pronóstico global, datos marinos y fallback de alta precisión.
- **Open-Meteo Geocoding:** Motor de búsqueda de localizaciones y ciudades.

---

## 🛠️ Instalación y Configuración

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
   Crea un archivo `.env` en la raíz de `tiempo-app/`:
   ```env
   EXPO_PUBLIC_AEMET_API_KEY=tu_api_key_aqui
   ```

4. **Ejecutar en Android:**
   ```bash
   npm run android
   ```

---

## 📅 Roadmap de Desarrollo

- [x] **Fase 0:** Scaffolding, TypeScript y NativeWind setup.
- [ ] **Fase 1:** Core de previsión (Actual + 7 días).
- [ ] **Fase 2:** Gestión de ciudades y persistencia.
- [ ] **Fase 3:** Integración de Mareas con Skia.
- [ ] **Fase 4:** Notificaciones Push y Alertas AEMET.
- [ ] **Fase 5:** Mapas meteorológicos interactivos.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](../LICENSE) para más detalles.

---

Desarrollado con ❤️ por Hugo Perez-Vigo
