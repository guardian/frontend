package controllers

import common.{WeatherMetrics, JsonComponent, Edition, ExecutionContexts}
import model.Cached
import models.CityResponse
import play.api.libs.json.{JsNull, Json}
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scala.concurrent.duration._
import scala.concurrent.Future
import scalaz.std.option.optionInstance.tuple2

object LocationsController extends Controller with ExecutionContexts {
  def findCity(query: String) = Action.async { implicit request =>
    WeatherApi.searchForLocations(query) map { locations =>
      Cached(7.days)(JsonComponent.forJsValue(Json.toJson(CityResponse.fromLocationResponses(locations.toList))))
    }
  }

  val CityHeader: String = "X-GU-GeoCity"
  val CountryHeader: String = "X-GU-GeoCountry"

  def whatIsMyCity() = Action.async { implicit request =>
    WeatherMetrics.whatIsMyCityRequests.increment()

    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    tuple2(
      request.headers.get(CityHeader),
      request.headers.get(CountryHeader)
    ) match {
      case Some((city, country)) =>
        WeatherApi.searchForLocations(city) map { locations =>
          val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)
          Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cities.headOption.getOrElse(cityFromRequestEdition))))
        }

      case None => Future.successful(Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cityFromRequestEdition))))
    }
  }

  def fakeWhatIsMyCity() = Action { implicit request =>
    /** This to gather data for reporting to AccuWeather on predicted usage */
    WeatherMetrics.whatIsMyCityRequests.increment()
    Cached(10.minutes)(JsonComponent.forJsValue(JsNull))
  }
}
