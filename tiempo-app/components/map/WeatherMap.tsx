import { useRef, useCallback, useMemo } from "react";
import { View } from "react-native";
import { WebView as RNWebView } from "react-native-webview";
import type { City } from "@/types/weather";
import { useThemeContext } from "@/components/theme";

interface WeatherMapProps {
  cities: City[];
  activeCity: City;
  onCityPress: (city: City) => void;
}

export function WeatherMap({ cities, activeCity, onCityPress }: WeatherMapProps) {
  const { isDark } = useThemeContext();
  const webviewRef = useRef<RNWebView>(null);

  const cityMarkers = useMemo(() => {
    return cities.map((city) => ({
      id: city.id,
      name: city.isLocation ? "Aquí" : city.name,
      lat: city.lat,
      lon: city.lon,
      isActive: city.id === activeCity.id,
      isLocation: !!city.isLocation,
    }));
  }, [cities, activeCity.id]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "cityPress") {
          const city = cities.find((c) => c.id === data.cityId);
          if (city) onCityPress(city);
        }
      } catch {}
    },
    [cities, onCityPress]
  );

  const html = useMemo(() => {
    const markersJson = JSON.stringify(cityMarkers);
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; }
  .city-marker {
    display:flex; flex-direction:column; align-items:center; gap:2px;
    cursor:pointer;
  }
  .marker-dot {
    width:24px; height:24px; border-radius:12px;
    background:rgba(0,122,255,0.9); border:1.5px solid #FFF;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    font-size:11px; color:#FFF;
  }
  .marker-dot.active {
    width:32px; height:32px; border-radius:16px;
    border-width:2.5px; border-color:#5AC8FA;
  }
  .marker-label {
    background:${isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.92)"};
    color:${isDark ? "#FFF" : "#000"};
    padding:2px 6px; border-radius:6px;
    font-size:10px; font-weight:500;
    white-space:nowrap;
  }
  .marker-label.active { font-size:12px; font-weight:700; }
  .leaflet-control-attribution { font-size:8px !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function(){
  var map = L.map('map', {
    center: [${activeCity.lat}, ${activeCity.lon}],
    zoom: 6,
    zoomControl: false,
    attributionControl: true
  });
  L.tileLayer('${tileUrl}', {
    attribution: '${attribution}',
    maxZoom: 12,
    minZoom: 3,
  }).addTo(map);

  var markers = ${markersJson};
  markers.forEach(function(m) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="city-marker" data-id="' + m.id + '">'
        + '<div class="marker-dot ' + (m.isActive ? 'active' : '') + '">'
        + (m.isLocation ? '⦿' : '📍')
        + '</div>'
        + '<div class="marker-label ' + (m.isActive ? 'active' : '') + '">'
        + m.name + '</div></div>',
      iconSize: [40, 50],
      iconAnchor: [20, 25],
    });
    var marker = L.marker([m.lat, m.lon], { icon: icon }).addTo(map);
    marker.on('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'cityPress', cityId: m.id
      }));
    });
  });

  setTimeout(function(){ map.invalidateSize(); }, 200);
})();
</script>
</body>
</html>`;
  }, [cityMarkers, activeCity.lat, activeCity.lon, isDark]);

  return (
    <View style={{ flex: 1 }}>
      <RNWebView
        ref={webviewRef}
        source={{ html }}
        style={{ flex: 1, backgroundColor: isDark ? "#1a1a2e" : "#f5f5f5" }}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        overScrollMode="never"
      />
    </View>
  );
}
