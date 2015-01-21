package controllers

import common.{JsonComponent, ExecutionContexts}
import model.Cached
import play.api.libs.json.{JsArray, Json}
import play.api.mvc.{Action, Controller}
import models.CityId
import weather.WeatherApi
import models.CityWeather

import scala.concurrent.duration._


object WeatherController extends Controller with ExecutionContexts {

  def forCity(id: String) = Action.async{ implicit request =>
    WeatherApi.getWeatherForCityId(CityId(id)).map{_.map{ weather =>
      //TODO well considered cache time
      Cached(900)(JsonComponent(views.html.cityWeather(weather)))
    }.getOrElse(Cached(60)(NotFound))
  }}
}
