package weather.models.accuweather

import common.Edition
import common.editions.Us
import model.dotcomrendering.{DotcomRenderingDataModel, ElementsEnhancer}
import play.api.libs.json.{Json, Writes}

/** Not all the fields AccuWeather supplies, just the ones we care about */

object WeatherResponse {
  implicit val jsonReads = Json.reads[WeatherResponse]

  implicit val writes = new Writes[WeatherResponse] {
    def writes(model: WeatherResponse) = {
      Json.obj(
        "weatherText" -> model.WeatherText,
        "weatherIcon" -> model.WeatherIcon,
        "link" -> model.Link,
        "temperature" -> model.Temperature,
      )
    }
  }
}

case class WeatherResponse(
    WeatherText: String,
    WeatherIcon: Int,
    Link: String,
    Temperature: Map[String, Temperature],
) {
  def temperatureForEdition(edition: Edition): Temperature =
    edition match {
      case Us => Temperature("Imperial")
      case _  => Temperature("Metric")
    }
}
