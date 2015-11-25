package weather.models.accuweather

import play.api.libs.json.Json

/** Not all the fields AccuWeather provides, but the ones we want */

object Temperature {
  implicit val jsonFormat = Json.format[Temperature]
}

case class Temperature(
  Value: Double,
  Unit: String
)

object ForecastResponse {
  implicit val jsonFormat = Json.format[ForecastResponse]
}

case class ForecastResponse(
  EpochDateTime: Int,
  WeatherIcon: Int,
  IconPhrase: String,
  Temperature: Temperature
)
