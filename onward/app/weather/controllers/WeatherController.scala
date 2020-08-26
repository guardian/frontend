package weather.controllers

import common.{ImplicitControllerExecutionContext, JsonComponent}
import model.Cached
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import weather.models.CityId
import weather.WeatherApi
import common.Seqs._

import scala.concurrent.duration._

class WeatherController(weatherApi: WeatherApi, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext {
  val MaximumForecastDays = 10

  def forCity(cityId: String): Action[AnyContent] =
    Action.async { implicit request =>
      weatherApi.getWeatherForCityId(CityId(cityId)).map { weather =>
        Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityWeather(weather)))
      }
    }

  def forecastForCityId(cityId: String): Action[AnyContent] =
    Action.async { implicit request =>
      weatherApi
        .getForecastForCityId(CityId(cityId))
        .map({ forecastDays =>
          val response =
            forecastDays.map(weather.models.ForecastResponse.fromAccuweather).filterByIndex(_ % 3 == 0).take(5)

          Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityForecast(response)))
        })
    }
}
