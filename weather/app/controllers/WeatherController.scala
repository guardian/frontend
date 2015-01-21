package controllers

import common.{JsonComponent, ExecutionContexts}
import model.Cached
import play.api.mvc.{Action, Controller}
import models.CityId
import weather.WeatherApi

import scala.concurrent.duration._


case class CityWeather(weatherText: String)

object WeatherController extends Controller with ExecutionContexts {
  def forCityId(cityId: String) = Action.async { implicit request =>
    WeatherApi.getWeatherForCityId(CityId(cityId)).map(json => Cached(10.minutes)(JsonComponent.forJsValue(json)))
  }


  /*

  {"LocalObservationDateTime":"2015-01-21T13:35:00+00:00","EpochTime":1421847300,"WeatherText":"Mostly cloudy","WeatherIcon":6,"IsDayTime":true,"Temperature":{"Metric":{"Value":2.8,"Unit":"C","UnitType":17},"Imperial":{"Value":37.0,"Unit":"F","UnitType":18}},"MobileLink":"http://m.accuweather.com/en/gb/london/ec4a-2/current-weather/328328?lang=en-us","Link":"http://www.accuweather.com/en/gb/london/ec4a-2/current-weather/328328?lang=en-us"}

   */

  def renderCity(id: String) = Action.async{ request =>

  WeatherApi.getWeatherForCityId(CityId(id)).map{ weather =>


    Cached(300)(JsonComponent(views.html.cityWeather(CityWeather("Good"))))
  }

  }

}
