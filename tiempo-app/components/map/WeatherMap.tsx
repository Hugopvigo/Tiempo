import { useRef, useCallback, useMemo, useState } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { WebView as RNWebView } from "react-native-webview";
import type { City } from "@/types/weather";
import { useThemeContext } from "@/components/theme";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { ThemedText } from "@/components/theme";

interface WeatherMapProps {
  cities: City[];
  activeCity: City;
  onCityPress: (city: City) => void;
  radarTileUrl: string | null;
  satelliteTileUrl: string | null;
  activeLayer: string;
}

export function WeatherMap({
  cities,
  activeCity,
  onCityPress,
  radarTileUrl,
  satelliteTileUrl,
  activeLayer,
}: WeatherMapProps) {
  const { isDark } = useThemeContext();
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
        }
      } catch {}
    },
    [cities, onCityPress]
  );

  const injectLayer = useCallback(() => {
    if (!webviewRef.current) return;
    const js = `
      (function(){
        if(!window._map) return;
        if(window._overlay) { window._map.removeLayer(window._overlay); window._overlay = null; }
        var layerType = "${activeLayer}";
        var radarUrl = ${radarTileUrl ? `"${radarTileUrl}"` : "null"};
        var satUrl = ${satelliteTileUrl ? `"${satelliteTileUrl}"` : "null"};
        var tileUrl = null;
        if(layerType === "precipitation" || layerType === "rain") tileUrl = radarUrl;
        else if(layerType === "clouds") tileUrl = satUrl;
        if(tileUrl) {
          window._overlay = L.tileLayer(tileUrl, {
            opacity: 0.7,
            maxZoom: 13,
            minZoom: 3,
          }).addTo(window._map);
        }
      })();
    `;
    webviewRef.current.injectJavaScript(js);
  }, [activeLayer, radarTileUrl, satelliteTileUrl]);

  const html = useMemo(() => {
    const markersJson = JSON.stringify(cityMarkers);
    const tileLayer = isDark
      ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
      : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";
    const radarUrl = radarTileUrl || "";
    const satUrl = satelliteTileUrl || "";
    const initialLayer = activeLayer;

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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

    var radarUrl="${radarUrl}";
    var satUrl="${satUrl}";
    var layerType="${initialLayer}";
    var tileUrl=null;
    if((layerType==="precipitation"||layerType==="rain")&&radarUrl) tileUrl=radarUrl;
    else if(layerType==="clouds"&&satUrl) tileUrl=satUrl;
    if(tileUrl){
      window._overlay=L.tileLayer(tileUrl,{opacity:0.7,maxZoom:13,minZoom:3}).addTo(map);
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
  }, [cityMarkers, activeCity.lat, activeCity.lon, isDark, radarTileUrl, satelliteTileUrl, activeLayer]);

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
            backgroundColor: isDark ? "#1a1a2e" : "#F5F7FA",
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
          style={{ flex: 1, backgroundColor: isDark ? "#1a1a2e" : "#F5F7FA" }}
          originWhitelist={["*"]}
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data);
              if (data.type === "mapReady") {
                setLoading(false);
                injectLayer();
              }
              else if (data.type === "mapError") setMapError(true);
              else handleMessage(e as any);
            } catch {}
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
            backgroundColor: isDark ? "#1a1a2e" : "#F5F7FA",
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
              {Math.round(current.temperature)}°
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
