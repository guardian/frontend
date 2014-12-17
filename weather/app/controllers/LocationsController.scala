package controllers

import common.ExecutionContexts
import models.LocationResponse
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scalaz.std.AllInstances._
import scalaz.syntax.foldable._

object CityResponse {
  implicit val jsonWrites = Json.writes[CityResponse]
}

case class CityResponse(
  id: String,
  city: String,
  country: String
)

object LocationsController extends Controller with ExecutionContexts {
  def findCity(query: String) = Action.async {
    WeatherApi.searchForLocations(query) map { locations =>

      def cityAndCountry(location: LocationResponse) = (location.EnglishName, location.Country.EnglishName)

      val citiesWithSameNameByCountry = locations.map({ location => Map(cityAndCountry(location) -> 1) }).toList.suml

      Ok(Json.toJson(locations.map { location =>

        val needsDisambiguating = citiesWithSameNameByCountry.get(cityAndCountry(location)).exists(_ > 1)

        val cityName = if (needsDisambiguating)
          s"${location.EnglishName}, ${location.AdministrativeArea.EnglishName}"
        else
          location.EnglishName

        CityResponse(
          location.Key,
          cityName,
          location.Country.EnglishName
        )
      }))
    }
  }
}
