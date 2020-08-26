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
    with Logging {

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

      val maybeCity = getEncodedHeader(CityHeader).filter(_.nonEmpty)
      val maybeRegion = getEncodedHeader(RegionHeader).filter(_.nonEmpty)
      val maybeCountry = getEncodedHeader(CountryHeader).filter(_.nonEmpty)

      (maybeCity, maybeRegion, maybeCountry) match {
        case (Some(city), Some(region), Some(country)) =>
          CitiesLookUp.getLatitudeLongitude(CityRef.makeFixedCase(city, region, country)) match {
            case Some(latitudeLongitude) =>
              log.info(s"Matched $city, $region, $country to $latitudeLongitude")

              weatherApi.getNearestCity(latitudeLongitude) map { location =>
                Cached(1 hour)(
                  JsonComponent(
                    CityResponse
                      .fromLocationResponse(location)
                      .copy(
                        // Prefer the city name in MaxMind - the one Accuweather returns is a bit more granular than we'd like,
                        // given how fuzzy geolocation by IP is.
                        city = city,
                      ),
                  ),
                )
              }

            case None =>
              log.warn(s"Could not find $city, $region, $country in database, trying text search")
              weatherApi.searchForLocations(city) map { locations =>
                val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)

                cities.headOption.fold {
                  Cached(CacheTime.NotFound)(JsonNotFound())
                } { weatherCity =>
                  Cached(1 hour)(JsonComponent(weatherCity))
                }
              }
          }

        case (_, _, _) =>
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
