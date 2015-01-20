package models

import play.api.libs.json.{JsString, JsValue, Writes, Json}

object Temperatures {
  implicit val jsonWrites = new Writes[Temperatures] {
    override def writes(o: Temperatures): JsValue = {
      def dec2(n: Double) = o.imperial.formatted("%.2f")

      Json.obj(
        "imperial" -> JsString(s"${dec2(o.imperial)}°F"),
        "metric" -> JsString(s"${dec2(o.metric)}°C")
      )
    }
  }

  def fromCelsius(celsius: Double): Temperatures = Temperatures(
    metric = celsius,
    imperial = (celsius * 9d / 5) + 32
  )

  def fromFahrenheit(fahrenheit: Double): Temperatures = Temperatures(
    imperial = fahrenheit,
    metric = (fahrenheit - 32) * 5d / 9
  )
}

case class Temperatures(
  imperial: Double,
  metric: Double
)
