package weather.models.accuweather

import common.Edition
import common.editions.Us
import play.api.libs.json.Json

/** Not all the fields AccuWeather supplies, just the ones we care about */

object WeatherResponse {
  implicit val jsonReads = Json.reads[WeatherResponse]
}

case class WeatherResponse(
  WeatherText: String,
  WeatherIcon: Int,
  Temperature: Map[String, Temperature]
) {
  def temperatureForEdition(edition: Edition) = edition match {
    case Us => Temperature.get("Imperial").get
    case _ => Temperature.get("Metric").get
  }
}
