package models

import java.text.DecimalFormat

import play.api.libs.json.{JsString, JsValue, Writes, Json}

object Temperatures {
  implicit val jsonWrites = new Writes[Temperatures] {
    override def writes(o: Temperatures): JsValue = {
      def formatN(n: Double) = new DecimalFormat("#.#").format(n)

      Json.obj(
        "imperial" -> JsString(s"${formatN(o.imperial)}°F"),
        "metric" -> JsString(s"${formatN(o.metric)}°C")
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
