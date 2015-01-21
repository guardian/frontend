package models

import common.Edition
import common.editions.Us
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Reads}

case class CityWeather(weatherText: String, weatherIcon: Int, metricTemperature: Temperature, imperialTemperature: Temperature) {
  def temperatureFor(edition: Edition): Temperature = if (edition == Us) imperialTemperature else metricTemperature
}

object CityWeather {
  implicit val jsonReads: Reads[CityWeather] = (
    (JsPath \ "WeatherText").read[String] and
    (JsPath \ "WeatherIcon").read[Int] and
    (JsPath \ "Temperature" \ "Metric").read[Temperature] and
    (JsPath \ "Temperature" \ "Imperial").read[Temperature]
  )(CityWeather.apply _)

}


case class Temperature(value: Double, unit: String)

object Temperature {
  implicit val jsonReads: Reads[Temperature] = (
    (JsPath \ "Value").read[Double] and (JsPath \ "Unit").read[String]
    )(Temperature.apply _)
}
