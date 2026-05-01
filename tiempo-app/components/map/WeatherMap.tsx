import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { WebView as RNWebView } from "react-native-webview";
import type { City } from "@/types/weather";
import { useThemeContext } from "@/components/theme";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { ThemedText } from "@/components/theme";
import { formatTemperature } from "@/constants/weather";
import { useSettingsStore } from "@/stores/cityStore";

interface WeatherMapProps {
  cities: City[];
  activeCity: City;
  onCityPress: (city: City) => void;
  radarTileUrl: string | null;
  satelliteTileUrl: string | null;
  owmLayers: Record<string, string | null>;
  activeLayer: string;
  useOwmClouds?: boolean;
  radarFrameUrls?: string[];
  isPlaying?: boolean;
  frameIndex?: number;
  pastCount?: number;
  onFrameChange?: (index: number) => void;
}

function sanitizeUrl(url: string): string {
  if (url.startsWith("https://")) return url;
  if (url.startsWith("data:image/")) return url;
  return "";
}

function resolveTileUrl(
  layer: string,
  radarUrl: string | null,
  satUrl: string | null,
  owmLayers: Record<string, string | null>,
  useOwmClouds: boolean
): string | null {
  if (layer === "precipitation" || layer === "rain") return radarUrl;
  if (layer === "clouds") {
    if (useOwmClouds && owmLayers["clouds"]) return owmLayers["clouds"];
    return satUrl;
  }
  if (owmLayers[layer]) return owmLayers[layer];
  return null;
}

export function WeatherMap({
  cities,
  activeCity,
  onCityPress,
  radarTileUrl,
  satelliteTileUrl,
  owmLayers,
  activeLayer,
  useOwmClouds = false,
  radarFrameUrls = [],
  isPlaying = false,
  frameIndex = -1,
  pastCount = 0,
  onFrameChange,
}: WeatherMapProps) {
  const { isDark } = useThemeContext();
  const { settings } = useSettingsStore();
  const webviewRef = useRef<RNWebView>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const { data: weather } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);

  const cityMarkers = useMemo(() => {
    return cities.map((city) => ({
      id: city.id,
      name: city.isLocation ? "Aqui" : city.name,
      lat: city.lat,
      lon: city.lon,
      isActive: city.id === activeCity.id,
      isLocation: !!city.isLocation,
    }));
  }, [cities, activeCity.id]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "cityPress") {
          const city = cities.find((c) => c.id === data.cityId);
          if (city) onCityPress(city);
        } else if (data.type === "frameChange" && onFrameChange) {
          onFrameChange(data.index);
        }
      } catch {}
    },
    [cities, onCityPress, onFrameChange]
  );

  const isRadarLayer = activeLayer === "precipitation" || activeLayer === "rain";

  const injectLayer = useCallback(() => {
    if (!webviewRef.current) return;
    const tileUrl = resolveTileUrl(activeLayer, radarTileUrl, satelliteTileUrl, owmLayers, useOwmClouds);
    if (!tileUrl) return;
    const isCloudsSat = activeLayer === "clouds" && !useOwmClouds;
    const overlayOpacity = isCloudsSat ? 0.9 : (isDark ? 0.85 : 0.7);
    const overlayMaxZoom = isCloudsSat ? 13 : 18;
    const js = `
(function(){
if(!window._map) return;
if(window._radarAnim) { clearInterval(window._radarAnim); window._radarAnim = null; }
window._radarFrames = null;
if(window._overlay) { window._map.removeLayer(window._overlay); window._overlay = null; }
  window._overlay = L.tileLayer("${sanitizeUrl(tileUrl)}", {
opacity: ${overlayOpacity},
maxZoom: ${overlayMaxZoom},
minZoom: ${isCloudsSat ? 4 : 3},
errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
}).addTo(window._map);
})();
`;
    webviewRef.current.injectJavaScript(js);
  }, [activeLayer, radarTileUrl, satelliteTileUrl, owmLayers, useOwmClouds, isDark]);

  const injectRadarAnimation = useCallback(() => {
    if (!webviewRef.current || radarFrameUrls.length === 0) return;
    const framesJson = JSON.stringify(radarFrameUrls);
    const overlayOpacity = isDark ? 0.85 : 0.7;
    const startIdx = frameIndex >= 0 ? frameIndex : radarFrameUrls.length - 1;
    const js = `
(function(){
if(!window._map) return;
if(window._overlay) { window._map.removeLayer(window._overlay); window._overlay = null; }
window._radarFrames = ${framesJson};
window._radarIdx = ${startIdx};
window._radarOpacity = ${overlayOpacity};
window._overlay = L.tileLayer(window._radarFrames[window._radarIdx], {
opacity: ${overlayOpacity},
maxZoom: 18,
minZoom: 3,
errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
}).addTo(window._map);
if(window._radarAnim) clearInterval(window._radarAnim);
window._radarAnim = setInterval(function(){
window._radarIdx = (window._radarIdx + 1) % window._radarFrames.length;
if(window._overlay) window._map.removeLayer(window._overlay);
window._overlay = L.tileLayer(window._radarFrames[window._radarIdx], {
opacity: ${overlayOpacity},
maxZoom: 18,
minZoom: 3,
errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
}).addTo(window._map);
window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:"frameChange",index:window._radarIdx}));
}, 800);
})();
`;
    webviewRef.current.injectJavaScript(js);
  }, [radarFrameUrls, isDark, frameIndex]);

  const injectRadarPause = useCallback(() => {
    if (!webviewRef.current) return;
    const js = `
(function(){
if(window._radarAnim) { clearInterval(window._radarAnim); window._radarAnim = null; }
})();
`;
    webviewRef.current.injectJavaScript(js);
  }, []);

  const injectRadarFrame = useCallback(() => {
    if (!webviewRef.current || frameIndex < 0 || !radarFrameUrls.length) return;
    const clamped = Math.max(0, Math.min(frameIndex, radarFrameUrls.length - 1));
    const url = radarFrameUrls[clamped];
    const overlayOpacity = isDark ? 0.85 : 0.7;
    const js = `
(function(){
if(!window._map) return;
window._radarIdx = ${clamped};
if(window._overlay) window._map.removeLayer(window._overlay);
  window._overlay = L.tileLayer("${sanitizeUrl(url)}", {
opacity: ${overlayOpacity},
maxZoom: 18,
minZoom: 3,
errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
}).addTo(window._map);
})();
`;
    webviewRef.current.injectJavaScript(js);
  }, [frameIndex, radarFrameUrls, isDark]);

  useEffect(() => {
    if (!isRadarLayer || radarFrameUrls.length === 0) return;
    if (isPlaying) {
      injectRadarAnimation();
    } else {
      injectRadarPause();
      if (frameIndex >= 0) injectRadarFrame();
    }
  }, [isPlaying, isRadarLayer, radarFrameUrls.length]);

  useEffect(() => {
    if (!isRadarLayer || isPlaying || !radarFrameUrls.length) return;
    if (frameIndex >= 0) injectRadarFrame();
  }, [frameIndex, isRadarLayer, isPlaying, radarFrameUrls.length]);

  const html = useMemo(() => {
    const markersJson = JSON.stringify(cityMarkers);
    const tileLayer = isDark
      ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
      : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";
    const initialTileUrl = resolveTileUrl(activeLayer, radarTileUrl, satelliteTileUrl, owmLayers, useOwmClouds) || "";

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}
.marker-wrap{display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:auto}
.dot{
width:22px;height:22px;border-radius:11px;
background:rgba(0,122,255,0.92);
border:2px solid #fff;
display:flex;align-items:center;justify-content:center;
box-shadow:0 2px 8px rgba(0,0,0,0.35);
}
.dot.active{width:30px;height:30px;border-radius:15px;border-color:${isDark ? "#5AC8FA" : "#007AFF"};border-width:2.5px}
.dot-inner{width:8px;height:8px;border-radius:4px;background:#fff}
.dot.active .dot-inner{width:10px;height:10px;border-radius:5px}
.dot.loc .dot-inner{background:none;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #fff}
.lbl{
background:${isDark ? "rgba(28,28,30,0.88)" : "rgba(255,255,255,0.95)"};
color:${isDark ? "#fff" : "#1c1c1e"};
padding:2px 7px;border-radius:4px;
font-size:10px;font-weight:600;font-family:-apple-system,sans-serif;
white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);
}
.lbl.active{font-size:11px}
.leaflet-control-attribution{font-size:7px!important;background:transparent!important;color:${isDark ? "#666" : "#999"}!important}
.leaflet-control-attribution a{color:${isDark ? "#888" : "#aaa"}!important}
</style>
</head>
<body>
<div id="map"></div>
<script>
document.addEventListener("DOMContentLoaded",function(){
try{
var map=L.map("map",{
center:[${activeCity.lat},${activeCity.lon}],
zoom:6,
zoomControl:false,
attributionControl:true
});
L.tileLayer("${tileLayer}",{
attribution:"&copy; OSM &copy; CARTO",
maxZoom:13,minZoom:3,
subdomains:"abcd"
}).addTo(map);

window._map=map;
window._overlay=null;

      var initUrl="${sanitizeUrl(initialTileUrl)}";
      if(initUrl){
        var isInitSat="${activeLayer}"==="clouds"&&!${useOwmClouds};
        var initOp=isInitSat?0.9:${isDark ? 0.85 : 0.7};
        var initMaxZoom=isInitSat?13:18;
        window._overlay=L.tileLayer(initUrl,{opacity:initOp,maxZoom:initMaxZoom,minZoom:isInitSat?4:3,errorTileUrl:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}).addTo(map);
      }

var markers=${markersJson};
for(var i=0;i<markers.length;i++){
(function(m){
var icon=L.divIcon({
className:"",
html:'<div class="marker-wrap">'
+'<div class="dot'+(m.isActive?" active":"")+(m.isLocation?" loc":"")+'"><div class="dot-inner"></div></div>'
+'<div class="lbl'+(m.isActive?" active":"")+'">'+m.name+'</div>'
+'</div>',
iconSize:[44,44],
iconAnchor:[22,22]
});
var marker=L.marker([m.lat,m.lon],{icon:icon}).addTo(map);
marker.on("click",function(){
if(window.ReactNativeWebView){
window.ReactNativeWebView.postMessage(JSON.stringify({type:"cityPress",cityId:m.id}));
}
});
})(markers[i]);
}

setTimeout(function(){map.invalidateSize()},300);
window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:"mapReady"}));
}catch(e){
window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:"mapError",error:e.message}));
}
});
</script>
</body>
</html>`;
    }, [cityMarkers, activeCity.lat, activeCity.lon, isDark, radarTileUrl, satelliteTileUrl, owmLayers, activeLayer, useOwmClouds]);

  const current = weather?.current;
  const condition = current?.condition;

  return (
    <View style={{ flex: 1 }}>
      {loading && !mapError && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
      backgroundColor: isDark ? "#0A0A0A" : "#F5F7FA",
      zIndex: 10,
    }}
  >
    <ActivityIndicator
      size="large"
      color={isDark ? "#5AC8FA" : "#007AFF"}
      />
    </View>
    )}

    {!mapError && (
    <RNWebView
      ref={webviewRef}
      source={{ html }}
      style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F5F7FA" }}
          originWhitelist={["about", "https"]}
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === "mapReady") {
              setLoading(false);
              if (isRadarLayer && radarFrameUrls.length > 0 && isPlaying) {
                injectRadarAnimation();
              } else {
                injectLayer();
              }
            }
            else if (data.type === "mapError") setMapError(true);
            else handleMessage(e as any);
          } catch {}
        }}
          onShouldStartLoadWithRequest={(req) => {
            const url = req.url;
            return url.startsWith("https://") || url.startsWith("about:") || url.startsWith("data:image/");
          }}
        onError={() => setMapError(true)}
          onHttpError={() => setMapError(true)}
          javaScriptEnabled
          domStorageEnabled
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled
          overScrollMode="never"
          cacheEnabled
        />
      )}

      {mapError && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
      backgroundColor: isDark ? "#0A0A0A" : "#F5F7FA",
      padding: 24,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🗺️</Text>
          <ThemedText style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>
            No se pudo cargar el mapa
          </ThemedText>
          <ThemedText secondary style={{ fontSize: 14, marginTop: 8, textAlign: "center" }}>
            Comprueba tu conexión a internet
          </ThemedText>
          <TouchableOpacity
            onPress={() => {
              setMapError(false);
              setLoading(true);
            }}
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: isDark ? "rgba(90,200,250,0.2)" : "rgba(0,122,255,0.12)",
              borderRadius: 20,
            }}
          >
            <ThemedText style={{ fontSize: 14, fontWeight: "500", color: isDark ? "#5AC8FA" : "#007AFF" }}>
              Reintentar
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {current && (
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 16,
            backgroundColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.92)",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {condition && <WeatherIcon condition={condition} size={20} />}
          <View>
        <ThemedText style={{ fontSize: 22, fontWeight: "500" }}>
          {formatTemperature(current.temperature, settings.temperatureUnit)}
        </ThemedText>
            <ThemedText secondary style={{ fontSize: 11 }}>
              {current.description}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}
