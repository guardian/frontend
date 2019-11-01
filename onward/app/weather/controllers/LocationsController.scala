package weather.controllers

import common._
import weather.geo._
import model.{CacheTime, Cached}
import weather.models.CityResponse
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import weather.WeatherApi

import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.Future

class LocationsController(weatherApi: WeatherApi, val controllerComponents: ControllerComponents) extends BaseController with ImplicitControllerExecutionContext with Logging {

  def findCity(query: String): Action[AnyContent] = Action.async { implicit request =>
    weatherApi.searchForLocations(query) map { locations =>
      Cached(7.days)(JsonComponent(CityResponse.fromLocationResponses(locations.toList)))
    }
  }

  val CityHeader: String = "X-GU-GeoCity"
  val CountryHeader: String = "X-GU-GeoCountry"
  val LatLongHeader: String = "X-GU-GeoLatLong"

  def whatIsMyCity(): Action[AnyContent] = Action.async { implicit request =>

    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    def getEncodedHeader(key: String) =
      request.headers.get(key).map(java.net.URLDecoder.decode(_, "latin1"))

    val maybeCity = getEncodedHeader(CityHeader).filter(_.nonEmpty)
    val maybeCountry = getEncodedHeader(CountryHeader).filter(_.nonEmpty)
    val maybeLatLong = getEncodedHeader(LatLongHeader)
      .flatMap(LatitudeLongitude.fromString)
      .map(LatitudeLongitude.toCityAccuracy)

    (maybeLatLong, maybeCity, maybeCountry) match {
      case (Some(latitudeLongitude), _, _) =>
        weatherApi.getNearestCity(latitudeLongitude).map {
          location => Cached(1 hour)(JsonComponent(CityResponse.fromLocationResponse(location)))
        }.recover {
          case _ =>
            log.warn(s"Failed to get nearest city with lat/long")
            Cached(CacheTime.NotFound)(JsonNotFound())
        }

      case (_, Some(city), Some(country)) =>
        log.warn(s"Latitude/longitude not available, trying text search")

        weatherApi.searchForLocations(city) map { locations =>
          val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)

          cities.headOption.fold {
            Cached(CacheTime.NotFound)(JsonNotFound())
          } { weatherCity =>
            Cached(1 hour)(JsonComponent(weatherCity))
          }
        }

      case (_, _, _) =>
        Future.successful(
          cityFromRequestEdition.fold {
            Cached(CacheTime.NotFound)(JsonNotFound())
          } { city =>
            Cached(1 hour)(JsonComponent(city))
          }
        )
    }
  }
}
