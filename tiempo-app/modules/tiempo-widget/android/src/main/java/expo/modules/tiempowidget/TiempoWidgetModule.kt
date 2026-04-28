package expo.modules.tiempowidget

import android.content.Context
import android.content.SharedPreferences
import expo.modules.kotlin.Promise
import expo.modules.kotlin.module.Module
import expo.modules.kotlin.module.ModuleDefinition
import com.hugopvigo.tiempo.WeatherWidgetProvider

class TiempoWidgetModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TiempoWidgetModule")

        AsyncFunction("updateWidgetData") { json: String, promise: Promise ->
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("tiempo-widget-data", Context.MODE_PRIVATE)
            prefs.edit().putString("widget_weather", json).apply()
            WeatherWidgetProvider.sendUpdateBroadcast(context)
            promise.resolve(null)
        }

        Function("requestWidgetUpdate") {
            val context = reactApplicationContext
            WeatherWidgetProvider.sendUpdateBroadcast(context)
        }
    }
}
