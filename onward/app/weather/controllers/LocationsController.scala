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

class LocationsController(weatherApi: WeatherApi, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  def findCity(query: String): Action[AnyContent] =
    Action.async { implicit request =>
      weatherApi.searchForLocations(query) map { locations =>
        Cached(7.days)(JsonComponent(CityResponse.fromLocationResponses(locations.toList)))
      }
    }

  val CityHeader: String = "X-GU-GeoCity"
  val RegionHeader: String = "X-GU-GeoRegion"
  val CountryHeader: String = "X-GU-GeoCountry"

  def whatIsMyCity(): Action[AnyContent] =
    Action.async { implicit request =>
      def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

      def getEncodedHeader(key: String) =
        request.headers.get(key).map(java.net.URLDecoder.decode(_, "latin1"))

      val maybeCountry = getEncodedHeader(CountryHeader).filter(_.nonEmpty)
      val maybeCity = getEncodedHeader(CityHeader).filter(_.nonEmpty)
      val maybeRegion = getEncodedHeader(RegionHeader).filter(_.nonEmpty)

      (maybeCountry, maybeCity) match {
        case (Some(countryCode), Some(city)) =>
          weatherApi.searchForCity(countryCode, city, maybeRegion) map { locations =>
            val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == countryCode).toList)
            cities.headOption.fold {
              log.warn(s"Could not find $countryCode, $city")
              Cached(CacheTime.NotFound)(JsonNotFound())
            } { weatherCity =>
              log.info(s"Matched $countryCode, $city, $maybeRegion to ${weatherCity.id}")
              Cached(1 hour)(JsonComponent(weatherCity))
            }
          }

        case (_, _) =>
          Future.successful(
            cityFromRequestEdition.fold {
              Cached(CacheTime.NotFound)(JsonNotFound())
            } { city =>
              Cached(1 hour)(JsonComponent(city))
            },
          )
      }
    }
}
