package controllers

import common.ExecutionContexts
import model.Cached
import play.api.mvc.{Action, Controller}
import models.CityId
import weather.WeatherApi

import scala.concurrent.duration._

object WeatherController extends Controller with ExecutionContexts {
  def forCityId(cityId: String) = Action.async {
    WeatherApi.getWeatherForCityId(CityId(cityId)).map(json => Cached(10.minutes)(Ok(json)))
  }
}
