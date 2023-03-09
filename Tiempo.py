# Importamos las librerías necesarias
import requests
import json

# Definimos la URL de la API del tiempo
url = "https://a.msn.com/54/ES-ES/ct40.4167,-3.7003?ocid=ansmsnweather"

# Hacemos una petición GET a la URL y obtenemos la respuesta
response = requests.get(url)

# Comprobamos si la respuesta es exitosa (código 200)
if response.status_code == 200:
    # Convertimos la respuesta en un diccionario de python
    data = json.loads(response.text)
    
    # Obtenemos el tiempo actual y la previsión diaria
    current_weather = data["current weather"]
    daily_forecast = data["daily_forecast"]
    
    # Imprimimos el tiempo actual en Madrid
    print(f"El tiempo actual en Madrid es: {current_weather}")
    
    # Imprimimos la previsión para los próximos 4 días
    print("La previsión para los próximos 4 días es:")
    
    for i in range(4):
        # Obtenemos la fecha, la temperatura máxima y mínima y la probabilidad de precipitación
        date = daily_forecast[i]["date"]
        high_temp = daily_forecast[i]["high_temp"]
        low_temp = daily_forecast[i]["low_temp"]
        precipitation_chance = daily_forecast[i]["precipitation_chance"]
        
        # Imprimimos la información para cada día
        print(f"- {date}: Temperatura máxima de {high_temp}°C, mínima de {low_temp}°C y probabilidad de precipitación del {precipitation_chance}%")
else:
    # Si la respuesta no es exitosa, imprimimos un mensaje de error
    print("No se ha podido obtener el tiempo en Madrid. Por favor, inténtalo más tarde.")