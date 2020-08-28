package weather.models

import common.Edition
import common.editions.Us
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import scala.util.Try

object ForecastResponse {

  def fromAccuweather(forecastResponse: accuweather.ForecastResponse): ForecastResponse = {
    val dateTime = Try(
      ISODateTimeFormat
        .dateTimeNoMillis()
        .withOffsetParsed()
        .parseDateTime(forecastResponse.DateTime),
    ).toOption
    ForecastResponse(
      dateTime,
      forecastResponse.WeatherIcon,
      forecastResponse.IconPhrase,
      forecastResponse.Temperature.Unit match {
        case "C" => Temperatures.fromCelsius(forecastResponse.Temperature.Value)
        case "F" => Temperatures.fromFahrenheit(forecastResponse.Temperature.Value)
        case _ =>
          throw new RuntimeException(
            "Temperature of neither celsius nor fahrenheit from " +
              s"Accuweather! $forecastResponse",
          )
      },
    )
  }
}

case class ForecastResponse(
    dateTime: Option[DateTime],
    weatherIcon: Int,
    weatherText: String,
    temperature: Temperatures,
) {
  def temperatureForEdition(edition: Edition): String = {
    edition match {
      case Us => s"${temperature.imperial.round}°F"
      case _  => s"${temperature.metric.round}°C"
    }
  }

  def hourString: String = dateTime.map(_.toString("HH:00")).getOrElse("")
}
