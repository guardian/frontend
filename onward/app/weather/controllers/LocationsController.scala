package weather.controllers

import common._
import weather.geo._
import model.{CacheTime, Cached}
import weather.models.CityResponse
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import weather.WeatherApi

import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.Future

class LocationsController(weatherApi: WeatherApi) extends Controller with ExecutionContexts with Logging {

  def findCity(query: String) = Action.async { implicit request =>
    weatherApi.searchForLocations(query) map { locations =>
      Cached(7.days)(JsonComponent(CityResponse.fromLocationResponses(locations.toList)))
    }
  }

  val CityHeader: String = "X-GU-GeoCity"
  val RegionHeader: String = "X-GU-GeoRegion"
  val CountryHeader: String = "X-GU-GeoCountry"

  def whatIsMyCity() = Action.async { implicit request =>

    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    def getEncodedHeader(key: String) =
      request.headers.get(key).map(java.net.URLDecoder.decode(_, "latin1"))

    val maybeCity = getEncodedHeader(CityHeader).filter(_.nonEmpty)
    val maybeRegion = getEncodedHeader(RegionHeader).filter(_.nonEmpty)
    val maybeCountry = getEncodedHeader(CountryHeader).filter(_.nonEmpty)

    log.info(s"What is my city request with headers $maybeCity $maybeRegion $maybeCountry")

    (maybeCity, maybeRegion, maybeCountry) match {
      case (Some(city), Some(region), Some(country)) =>
        log.info(s"Received what is my city? request. Geo info: City=$city Region=$region Country=$country")

        CitiesLookUp.getLatitudeLongitude(CityRef(city, region, country)) match {
          case Some(latitudeLongitude) =>
            log.info(s"Matched $city, $region, $country to $latitudeLongitude")

            weatherApi.getNearestCity(latitudeLongitude) map { location =>
              Cached(1 hour)(JsonComponent(CityResponse.fromLocationResponse(location).copy(
                // Prefer the city name in MaxMind - the one Accuweather returns is a bit more granular than we'd like,
                // given how fuzzy geolocation by IP is.
                city = city
              )))
            }

          case None =>
            log.warn(s"Could not find $city, $region, $country in database, trying text search")
            weatherApi.searchForLocations(city) map { locations =>
              val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)
              val weatherCity = cities.headOption.getOrElse(cityFromRequestEdition)

              log.info(s"Resolved geo info (City=$city Region=$region Country=$country) to city $weatherCity")

              Cached(1 hour)(JsonComponent(weatherCity))
            }
        }

      case (_, _, _) =>
        cityFromRequestEdition.fold
          { Future.successful(Cached(CacheTime.NotFound)(JsonNotFound())) }
          { city => Future.successful(Cached(1 hour)(JsonComponent(city))) }
    }
  }
}
