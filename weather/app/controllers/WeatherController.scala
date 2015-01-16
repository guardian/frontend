package controllers

import common.{JsonComponent, ExecutionContexts}
import model.Cached
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import models.CityId
import weather.WeatherApi

import scala.concurrent.duration._

object WeatherController extends Controller with ExecutionContexts {
  val MaximumForecastDays = 6

  def forCityId(cityId: String) = Action.async { implicit request =>
    WeatherApi.getWeatherForCityId(CityId(cityId)).map(json => Cached(10.minutes)(JsonComponent.forJsValue(json)))
  }

  def forecastForCityId(cityId: String) = Action.async { implicit request =>
    WeatherApi.getForecastForCityId(CityId(cityId)).map({ forecastDays =>
      Cached(10.minutes)(JsonComponent.forJsValue(Json.toJson(forecastDays.take(MaximumForecastDays))))
    })
  }
}
