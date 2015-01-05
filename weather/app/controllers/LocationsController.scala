package controllers

import common.{Edition, ExecutionContexts}
import models.{CityResponse, City, CityId}
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scala.concurrent.Future

object LocationsController extends Controller with ExecutionContexts {
  def findCity(query: String) = Action.async {
    WeatherApi.searchForLocations(query) map { locations =>
      Ok(Json.toJson(CityResponse.fromLocationResponses(locations.toList)))
    }
  }

  val LocationHeader: String = "X-GU-GeoCity"

  def whatIsMyCity() = Action.async { implicit request =>
    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    request.headers.get(LocationHeader) match {
      case Some(city) =>
        WeatherApi.searchForLocations(city) map { locations =>
          val cities = CityResponse.fromLocationResponses(locations.toList)
          Ok(Json.toJson(cities.headOption.getOrElse(cityFromRequestEdition)))
        }

      case None => Future.successful(Ok(Json.toJson(cityFromRequestEdition)))
    }
  }
}
