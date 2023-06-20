package weather.models.accuweather

import play.api.libs.json.{Json, Writes}

/** Not all the fields AccuWeather provides, but the ones we want */

object Temperature {
  implicit val jsonFormat = Json.format[Temperature]

  implicit val writes = new Writes[Temperature] {
    def writes(model: Temperature) = {
      Json.obj(
        "value" -> model.Value,
        "unit" -> model.Unit,
      )
    }
  }
}

case class Temperature(
    Value: Double,
    Unit: String,
)

object ForecastResponse {
  implicit val jsonFormat = Json.format[ForecastResponse]

  implicit val writes = new Writes[ForecastResponse] {
    def writes(model: ForecastResponse) = {
      Json.obj(
        "dateTime" -> model.DateTime,
        "weatherIcon" -> model.WeatherIcon,
        "iconPhrase" -> model.IconPhrase,
        "temperature" -> model.Temperature,
      )
    }
  }
}

case class ForecastResponse(
    DateTime: String,
    WeatherIcon: Int,
    IconPhrase: String,
    Temperature: Temperature,
)
