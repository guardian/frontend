package models

import play.api.libs.json.Json

object WeatherResponse {
  implicit val jsonWrites = Json.writes[WeatherResponse]

  def fromAccuweather(weatherResponse: accuweather.WeatherResponse): WeatherResponse = WeatherResponse(
    weatherResponse.WeatherText,
    weatherResponse.WeatherIcon,
    Temperatures.fromFahrenheit(weatherResponse.Temperature("F").Value)
  )
}

case class WeatherResponse(
  weatherText: String,
  weatherIcon: Int,
  temperature: Temperatures
)
