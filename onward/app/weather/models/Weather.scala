package weather.models

import play.api.libs.json.{Json, Writes}
import play.api.libs.json.Reads

object Weather {
  implicit val jsonReads: Reads[Weather] = Json.reads[Weather]

  implicit val writes: Writes[Weather] = new Writes[Weather] {
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
