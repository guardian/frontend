package weather.models

import play.api.libs.json.Json

object WeatherResponse {
  implicit val jsonWrites = Json.writes[WeatherResponse]

  def fromAccuweather(weatherResponse: accuweather.WeatherResponse): WeatherResponse = WeatherResponse(
    weatherResponse.WeatherText,
    weatherResponse.WeatherIcon,
    Temperatures.fromCelsius(weatherResponse.Temperature("Metric").Value)
  )
}

case class WeatherResponse(
  weatherText: String,
  weatherIcon: Int,
  temperature: Temperatures
)
