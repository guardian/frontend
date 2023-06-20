package weather.models.accuweather

import play.api.libs.json.{Json, Writes}

object TheWeather {
  implicit val jsonReads = Json.reads[TheWeather]

  implicit val writes = new Writes[TheWeather] {
    def writes(model: TheWeather) = {
      Json.obj(
        "location" -> model.location,
        "weather" -> model.weather,
        "forecast" -> model.forecast,
      )
    }
  }
}
case class TheWeather(
    location: LocationResponse,
    weather: WeatherResponse,
    forecast: Seq[ForecastResponse],
)
