package controllers

import common.ExecutionContexts
import play.api.mvc.{Action, Controller}
import models.{City, CityId}
import weather.WeatherApi
import scala.concurrent.Future

object WeatherController extends Controller with ExecutionContexts {
  def forCity(name: String) = Action.async {
    WeatherApi.getCityIdForCity(City(name)).flatMap {
      case Some(cityId) => WeatherApi.getWeatherForCityId(cityId).map(Ok(_))
      case None => Future.successful(NotFound)
    }
  }

  def forCityId(cityId: String) = Action.async {
    WeatherApi.getWeatherForCityId(CityId(cityId)).map(Ok(_))
  }

  def forRequest() = Action.async { implicit request =>
    CityId.fromRequest(request).flatMap { cityId =>
      WeatherApi.getWeatherForCityId(cityId).map(Ok(_))
    }
  }
}
