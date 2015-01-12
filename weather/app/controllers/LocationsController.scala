package controllers

import common.{Edition, ExecutionContexts}
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
      Cached(7.days)(Ok(Json.toJson(CityResponse.fromLocationResponses(locations.toList))))
    }
  }

  val LocationHeader: String = "X-GU-GeoCity"

  def whatIsMyCity() = Action.async { implicit request =>
    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    request.headers.get(LocationHeader) match {
      case Some(city) =>
        WeatherApi.searchForLocations(city) map { locations =>
          val cities = CityResponse.fromLocationResponses(locations.toList)
          Cached(7.days)(Ok(Json.toJson(cities.headOption.getOrElse(cityFromRequestEdition))))
        }

      case None => Future.successful(Ok(Json.toJson(cityFromRequestEdition)))
    }
  }
}
