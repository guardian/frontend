package controllers

import common._
import geo.{CityRef, CitiesLookUp}
import model.Cached
import models.CityResponse
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import weather.WeatherApi

import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.Future
import scalaz.std.option.optionInstance.tuple3

object LocationsController extends Controller with ExecutionContexts with Logging {
  def findCity(query: String) = Action.async { implicit request =>
    WeatherApi.searchForLocations(query) map { locations =>
      Cached(7.days)(JsonComponent.forJsValue(Json.toJson(CityResponse.fromLocationResponses(locations.toList))))
    }
  }

  val CityHeader: String = "X-GU-GeoCity"
  val RegionHeader: String = "X-GU-GeoRegion"
  val CountryHeader: String = "X-GU-GeoCountry"

  def whatIsMyCity() = Action.async { implicit request =>
    WeatherMetrics.whatIsMyCityRequests.increment()

    def cityFromRequestEdition = CityResponse.fromEdition(Edition(request))

    (tuple3(
      request.headers.get(CityHeader),
      request.headers.get(RegionHeader),
      request.headers.get(CountryHeader)
    ) match {
      case Some((city, region, country)) =>
        log.info(s"Received what is my city? request. Geo info: City=$city Region=$region Country=$country")

        CitiesLookUp.getLatitudeLongitude(CityRef(city, region, country)) match {
          case Some(latitudeLongitude) =>
            log.info(s"Matched $city, $region, $country to $latitudeLongitude")

            WeatherApi.getNearestCity(latitudeLongitude) map { location =>
              Cached(1 minute)(JsonComponent.forJsValue(Json.toJson(CityResponse.fromLocationResponse(location).copy(
                // Prefer the city name in MaxMind - the one Accuweather returns is a bit more granular than we'd like,
                // given how fuzzy geolocation by IP is.
                city = city
              ))))
            }

          case None =>
            log.warn(s"Could not find $city, $region, $country in database, trying text search")
            WeatherApi.searchForLocations(city) map { locations =>
              val cities = CityResponse.fromLocationResponses(locations.filter(_.Country.ID == country).toList)
              val weatherCity = cities.headOption.getOrElse(cityFromRequestEdition)

              log.info(s"Resolved geo info (City=$city Region=$region Country=$country) to city $weatherCity")

              Cached(1 minute)(JsonComponent.forJsValue(Json.toJson(weatherCity)))
            }
        }

      case None => Future.successful(Cached(7.days)(JsonComponent.forJsValue(Json.toJson(cityFromRequestEdition))))
    }) map { response =>
      response.withHeaders(
        CityHeader -> request.headers.get(CityHeader).toString,
        RegionHeader -> request.headers.get(RegionHeader).toString,
        CountryHeader -> request.headers.get(CountryHeader).toString
      )
    }
  }
}
