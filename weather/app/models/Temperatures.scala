package models

import java.text.DecimalFormat

import play.api.libs.json.{JsString, JsValue, Writes, Json}

object Temperatures {
  implicit val jsonWrites = new Writes[Temperatures] {
    override def writes(o: Temperatures): JsValue = {

      Json.obj(
        "imperial" -> JsString(s"${o.imperial.round}°F"),
        "metric" -> JsString(s"${o.metric.round}°C")
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
