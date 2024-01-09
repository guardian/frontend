package weather.models

import play.api.libs.json.{JsValue, Json, Writes}
import play.api.libs.json.Reads

object Temperatures {
  implicit val jsonReads: Reads[Temperatures] = Json.reads[Temperatures]

  implicit val jsonWrites: Writes[Temperatures] = new Writes[Temperatures] {
    override def writes(o: Temperatures): JsValue = {

      Json.obj(
        "metric" -> o.metric,
        "imperial" -> o.imperial,
      )
    }
  }

  def fromCelsius(celsius: Double): Temperatures =
    Temperatures(
      metric = celsius.round,
      imperial = ((celsius * 9d / 5) + 32).round,
    )

  def fromFahrenheit(fahrenheit: Double): Temperatures =
    Temperatures(
      metric = ((fahrenheit - 32) * 5d / 9).round,
      imperial = fahrenheit.round,
    )
}

case class Temperatures(
    metric: Long,
    imperial: Long,
)
