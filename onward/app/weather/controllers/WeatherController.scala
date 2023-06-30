package weather.controllers

import common.JsonComponent.resultFor
import common.Seqs.RichSeq
import common.{Edition, ImplicitControllerExecutionContext, JsonComponent}
import model.Cached
import play.api.libs.json.Json.{stringify, toJson}
import play.api.mvc._
import weather.WeatherApi
import weather.models.{CityId, CityResponse, Weather, WeatherResponse}

import scala.concurrent.Future
import scala.concurrent.duration._

class WeatherController(weatherApi: WeatherApi, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext {
  val MaximumForecastDays = 10

  def theWeather(): Action[AnyContent] =
    Action.async { implicit request =>
      val (country, city, region) = readLocationHeaders

      for {
        location <- whatIsMyCity(country, city, region)
        currentWeather <- weatherApi.getWeatherForCityId(CityId(location.id))
        forecasts <- weatherApi.getForecastForCityId(CityId(location.id))
      } yield {
        val weather = Weather(
          location = location,
          weather = WeatherResponse.fromAccuweather(currentWeather),
          forecast = forecasts.map(WeatherResponse.fromAccuweather),
        )
        val weatherJson = stringify(toJson(weather))
        Cached(10.minutes)(resultFor(request, weatherJson))
      }
    }

  def forCity(cityId: String): Action[AnyContent] =
    Action.async { implicit request =>
      weatherApi.getWeatherForCityId(CityId(cityId)).map { weather =>
        Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityWeather(weather)))
      }
    }

  def forecastForCityId(cityId: String): Action[AnyContent] =
    Action.async { implicit request =>
      weatherApi
        .getForecastForCityId(CityId(cityId))
        .map({ forecastDays =>
          val response =
            forecastDays.map(weather.models.ForecastResponse.fromAccuweather).filterByIndex(_ % 3 == 0).take(5)

          Cached(10.minutes)(JsonComponent(views.html.weatherFragments.cityForecast(response)))
        })
    }

  private def readLocationHeaders(implicit request: Request[AnyContent]) = {
    val CityHeader = "X-GU-GeoCity"
    val RegionHeader = "X-GU-GeoRegion"
    val CountryHeader = "X-GU-GeoCountry"

    def getEncodedHeader(key: String)(implicit request: Request[AnyContent]) =
      request.headers.get(key).map(java.net.URLDecoder.decode(_, "latin1"))

    val country = getEncodedHeader(CountryHeader)
    val city = getEncodedHeader(CityHeader)
    val region = getEncodedHeader(RegionHeader)

    (country, city, region)
  }

  private def whatIsMyCity(maybeCountry: Option[String], maybeCity: Option[String], maybeRegion: Option[String])(
      implicit request: Request[AnyContent],
  ): Future[CityResponse] = {
    (maybeCountry, maybeCity) match {
      case (Some(countryCode), Some(city)) if countryCode.nonEmpty && city.nonEmpty =>
        weatherApi.searchForCity(countryCode, city) flatMap { locations =>
          locations
            .filter(_.Country.ID == countryCode)
            .sortBy(_.AdministrativeArea.ID match {
              // We want to get cities within a matching region to come up first
              case region if maybeRegion.contains(region) => 0
              case _                                      => 1
            })
            .headOption match {
            case Some(location) => Future.successful(CityResponse.fromLocationResponse(location))
            case None =>
              Future.failed(
                CityNotfoundException(
                  s"Could not match country [${maybeCountry}], " +
                    s"city [${maybeCity}] and region [${maybeRegion}]" +
                    s"to a valid location.",
                ),
              )
          }
        }
      case (_, _) =>
        val edition = Edition(request)
        CityResponse.fromEdition(edition) match {
          case Some(defaultLocation) => Future.successful(defaultLocation)
          case None =>
            Future.failed(
              CityNotfoundException(
                s"Could not work out a default location for edition [${edition}].",
              ),
            )
        }
    }
  }

}

case class CityNotfoundException(message: String) extends Exception(message)
