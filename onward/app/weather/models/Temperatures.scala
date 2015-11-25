package weather.models

import play.api.libs.json.{JsString, JsValue, Writes, Json}

object Temperatures {
  implicit val jsonWrites = new Writes[Temperatures] {
    override def writes(o: Temperatures): JsValue = {

      Json.obj(
        "metric" -> JsString(s"${o.metric.round}°C"),
        "imperial" -> JsString(s"${o.imperial.round}°F")
      )
    }
  }

  def fromCelsius(celsius: Double): Temperatures = Temperatures(
    metric = celsius,
    imperial = (celsius * 9d / 5) + 32
  )

  def fromFahrenheit(fahrenheit: Double): Temperatures = Temperatures(
    metric = (fahrenheit - 32) * 5d / 9,
    imperial = fahrenheit
  )
}

case class Temperatures(
  metric: Double,
  imperial: Double
)
