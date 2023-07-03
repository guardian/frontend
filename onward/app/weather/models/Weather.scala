package weather.models

import play.api.libs.json.{Json, Writes}

object Weather {
  implicit val jsonReads = Json.reads[Weather]

  implicit val writes = new Writes[Weather] {
    def writes(model: Weather) = {
      Json.obj(
        "location" -> model.location,
        "weather" -> model.weather,
        "forecast" -> model.forecast,
      )
    }
  }
}

case class Weather(
    location: CityResponse,
    weather: WeatherResponse,
    forecast: Seq[WeatherResponse],
)
