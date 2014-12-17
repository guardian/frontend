package controllers

import common.ExecutionContexts
import play.api.mvc.{Action, Controller}
import models.CityId
import weather.WeatherApi

object WeatherController extends Controller with ExecutionContexts {
  def forCityId(cityId: String) = Action.async {
    WeatherApi.getWeatherForCityId(CityId(cityId)).map(Ok(_))
  }
}
