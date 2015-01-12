package controllers

import common.{WeatherMetrics, JsonComponent, Edition, ExecutionContexts}
import model.Cached
import models.CityResponse
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scala.concurrent.duration._
import scala.concurrent.Future

object LocationsController extends Controller with ExecutionContexts {
  def findCity(query: String) = Action.async {
    WeatherApi.searchForLocations(query) map { locations =>
      Cached(7.days)(JsonComponent.forJsValue(Json.toJson(CityResponse.fromLocationResponses(locations.toList))))
    }
  }

  val LocationHeader: String = "X-GU-GeoCity"

  def whatIsMyCity() = Action.async { implicit request =>
    WeatherMetrics.whatIsMyCityRequests.increment()
    
    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    request.headers.get(LocationHeader) match {
      case Some(city) =>
        WeatherApi.searchForLocations(city) map { locations =>
          val cities = CityResponse.fromLocationResponses(locations.toList)
          Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cities.headOption.getOrElse(cityFromRequestEdition))))
        }

      case None => Future.successful(Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cityFromRequestEdition))))
    }
  }

  def fakeWhatIsMyCity() = Action { implicit request =>
    /** This to gather data for reporting to AccuWeather on predicted usage */
    WeatherMetrics.whatIsMyCityRequests.increment()
    Cached(10.minutes)(Ok("Recorded"))
  }
}
