package weather.models.accuweather

import play.api.libs.json.{Json, OFormat}

/** Not all the fields AccuWeather provides, but the ones we want */

object Temperature {
  implicit val jsonFormat: OFormat[Temperature] = Json.format[Temperature]
}

case class Temperature(
    Value: Double,
    Unit: String,
)

object ForecastResponse {
  implicit val jsonFormat: OFormat[ForecastResponse] = Json.format[ForecastResponse]
}

case class ForecastResponse(
    DateTime: String,
    WeatherIcon: Int,
    IconPhrase: String,
    Temperature: Temperature,
)
