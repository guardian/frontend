package models

import play.api.libs.json.Json

object ForecastResponse {
  implicit val jsonWrites = Json.writes[ForecastResponse]

  def fromAccuweather(forecastResponse: accuweather.ForecastResponse): ForecastResponse = {
    ForecastResponse(
      forecastResponse.EpochDateTime,
      forecastResponse.WeatherIcon,
      forecastResponse.IconPhrase,
      forecastResponse.Temperature.Unit match {
        case "C" => Temperatures.fromCelsius(forecastResponse.Temperature.Value)
        case "F" => Temperatures.fromFahrenheit(forecastResponse.Temperature.Value)
        case _ =>
          throw new RuntimeException("Temperature of neither celsius nor fahrenheit from " +
            s"Accuweather! $forecastResponse")
      }
    )
  }
}

case class ForecastResponse(
  epochDateTime: Int,
  weatherIcon: Int,
  weatherText: String,
  temperature: Temperatures
)
