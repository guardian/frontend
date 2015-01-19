package controllers

import common._
import geo.{CityRef, CitiesLookUp}
import model.Cached
import models.CityResponse
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scala.concurrent.duration._
import scala.concurrent.Future
import scalaz.std.option.optionInstance.tuple2

object LocationsController extends Controller with ExecutionContexts with Logging {
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
        log.info(s"Received what is my city? request. Geo info: City=$city Country=$country")

        CitiesLookUp.getLatitudeLongitude(CityRef(city, country)) match {
          case Some(latitudeLongitude) =>
            log.info(s"Matched $city, $country to $latitudeLongitude")

            WeatherApi.getNearestCity(latitudeLongitude) map { location =>
              Cached(7.days)(JsonComponent.forJsValue(Json.toJson(CityResponse.fromLocationResponse(location))))
            }

          case None =>
            WeatherApi.searchForLocations(city) map { locations =>
              val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)
              val weatherCity = cities.headOption.getOrElse(cityFromRequestEdition)

              log.info(s"Resolved geo info (City=$city Country=$country) to city $weatherCity")

              Cached(7.days)(JsonComponent.forJsValue(Json.toJson(weatherCity)))
            }
        }

      case None => Future.successful(Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cityFromRequestEdition))))
    }
  }
}
