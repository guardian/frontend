package weather.models

import play.api.libs.json.{Json, Writes}

object WeatherResponse {
  implicit val jsonReads = Json.reads[WeatherResponse]

  implicit val writes = new Writes[WeatherResponse] {
    def writes(model: WeatherResponse) = {
      Json.obj(
        "description" -> model.weatherText,
        "icon" -> model.weatherIcon,
        "link" -> model.weatherLink,
        "temperature" -> model.temperature,
        "dateTime" -> model.dateTime,
      )
    }
  }

  def fromAccuweather(weatherResponse: accuweather.WeatherResponse): WeatherResponse =
    WeatherResponse(
      weatherText = weatherResponse.WeatherText,
      weatherIcon = weatherResponse.WeatherIcon,
      weatherLink = Some(weatherResponse.Link),
      temperature = Temperatures.fromCelsius(weatherResponse.Temperature("Metric").Value),
      dateTime = None,
    )

  def fromAccuweather(forecastResponse: accuweather.ForecastResponse): WeatherResponse =
    WeatherResponse(
      weatherText = forecastResponse.IconPhrase,
      weatherIcon = forecastResponse.WeatherIcon,
      weatherLink = None,
      temperature = Temperatures.fromFahrenheit(forecastResponse.Temperature.Value),
      dateTime = Some(forecastResponse.DateTime),
    )
}

case class WeatherResponse(
    weatherText: String,
    weatherIcon: Int,
    weatherLink: Option[String],
    temperature: Temperatures,
    dateTime: Option[String],
)
