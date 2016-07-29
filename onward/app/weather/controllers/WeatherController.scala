package weather.controllers

import common.{JsonComponent, ExecutionContexts}
import model.Cached
import play.api.mvc.{Action, Controller}
import weather.models.CityId
import weather.WeatherApi
import common.Seqs._
import scala.concurrent.duration._

class WeatherController(weatherApi: WeatherApi) extends Controller with ExecutionContexts {
  val MaximumForecastDays = 10

  def forCity(cityId: String) = Action.async{ implicit request =>
    weatherApi.getWeatherForCityId(CityId(cityId)).map{ weather =>
      Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityWeather(weather)))
    }
  }

  def forecastForCityId(cityId: String) = Action.async { implicit request =>
    weatherApi.getForecastForCityId(CityId(cityId)).map({ forecastDays =>
      val response = forecastDays.map(weather.models.ForecastResponse.fromAccuweather).filterByIndex(_ % 3 == 0).take(5)

      Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityForecast(response)))
    })
  }
}
