package weather

import java.net.{URI, URLEncoder}
import java.util.concurrent.TimeoutException

import akka.actor.{ActorSystem, Scheduler}
import common.{GuLogging, ResourcesHelper}
import conf.Configuration
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import weather.geo.LatitudeLongitude
import weather.models.CityId
import weather.models.accuweather.{ForecastResponse, LocationResponse, WeatherResponse}
import model.ApplicationContext

import scala.concurrent.duration._
import play.api.{MarkerContext, Mode}
import net.logstash.logback.marker.Markers.append

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import akka.pattern.after

class WeatherApi(wsClient: WSClient, context: ApplicationContext, actorSystem: ActorSystem)(implicit
    ec: ExecutionContext,
) extends ResourcesHelper
    with GuLogging {

  // NOTE: If you change the API Key, you must also update the weatherapi fastly configuration, as it is enforced there
  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(
    throw new RuntimeException("Weather API Key not set"),
  )

  val requestTimeout: FiniteDuration = 300.milliseconds
  val requestRetryMax: Int = 3
  val requestRetryDelay: FiniteDuration = 100.milliseconds

  val accuWeatherApiUri = "https://weather.guardianapis.com"

  private def autocompleteUrl(query: String): String =
    s"$accuWeatherApiUri/locations/v1/cities/autocomplete?apikey=$weatherApiKey&q=${URLEncoder.encode(query, "utf-8")}"

  private def cityLookUp(cityId: CityId): String =
    s"$accuWeatherApiUri/currentconditions/v1/${cityId.id}.json?apikey=$weatherApiKey"

  private def forecastLookUp(cityId: CityId): String =
    s"$accuWeatherApiUri/forecasts/v1/hourly/24hour/${cityId.id}.json?details=true&apikey=$weatherApiKey"

  private def latitudeLongitudeUrl(latitudeLongitude: LatitudeLongitude): String = {
    s"$accuWeatherApiUri/locations/v1/cities/geoposition/search.json?q=$latitudeLongitude&apikey=$weatherApiKey"
  }

  private def searchForCityUrl(countryCode: String, city: String, regionCode: Option[String]): String = {
    val regionPath = regionCode.map(code => s"/$code").getOrElse("")
    s"$accuWeatherApiUri/locations/v1/cities/$countryCode$regionPath/search.json?q=$city&apikey=$weatherApiKey"
  }

  private def getJson(url: String): Future[JsValue] = {
    if (context.environment.mode == Mode.Test) {
      Future(Json.parse(slurpOrDie(new URI(url).getPath.stripPrefix("/"))))
    } else {
      getJsonWithRetry(url)
    }
  }

  private def getJsonWithRetry(url: String): Future[JsValue] = {
    val weatherLogsMarkerContext: MarkerContext = MarkerContext(append("weatherRequestPath", url))
    val weatherApiResponse: Future[JsValue] = WeatherApi.retryWeatherRequest(
      () => getJsonRequest(url),
      requestRetryDelay,
      actorSystem.scheduler,
      requestRetryMax,
    )
    weatherApiResponse.failed.foreach {
      case error: TimeoutException =>
        log.warn(
          s"Request to weather api ($url) timed out (this is expected, especially at 0 and 30 mins past the hour due to" +
            s" a problem with accuweather).",
          error,
        )(weatherLogsMarkerContext)
      case error: Throwable =>
        log.error("Weather API request failed", error)(weatherLogsMarkerContext)
    }
    weatherApiResponse
  }

  private def getJsonRequest(url: String): Future[JsValue] = {
    wsClient
      .url(url)
      .withRequestTimeout(requestTimeout)
      .get()
      .map { response =>
        if (response.status == 200) response.json else throw new RuntimeException(s"Weather API response: $response")
      }
  }

  def searchForLocations(query: String): Future[Seq[LocationResponse]] =
    getJson(autocompleteUrl(query)).map({ r =>
      Json.fromJson[Seq[LocationResponse]](r).get
    })

  def searchForCity(countryCode: String, city: String, regionCode: Option[String]) =
    getJson(searchForCityUrl(countryCode, city, regionCode)).map({ r =>
      Json.fromJson[Seq[LocationResponse]](r).get
    })

  def getNearestCity(latitudeLongitude: LatitudeLongitude): Future[LocationResponse] =
    getJson(latitudeLongitudeUrl(latitudeLongitude)).map({ r =>
      Json.fromJson[LocationResponse](r).get
    })

  def getWeatherForCityId(cityId: CityId): Future[WeatherResponse] =
    getJson(cityLookUp(cityId)).map({ r =>
      Json.fromJson[Seq[WeatherResponse]](r).get.headOption getOrElse {
        throw new RuntimeException(s"Empty weather response for $cityId")
      }
    })

  def getForecastForCityId(cityId: CityId): Future[Seq[ForecastResponse]] =
    getJson(forecastLookUp(cityId)).map({ r =>
      Json.fromJson[Seq[ForecastResponse]](r).get
    })
}

object WeatherApi extends GuLogging {

  def retryWeatherRequest(
      request: () => Future[JsValue],
      retryDelay: FiniteDuration,
      scheduler: Scheduler,
      attempts: Int,
  )(implicit ec: ExecutionContext): Future[JsValue] = {
    def loop(attemptsRemaining: Int): Future[JsValue] = {
      request().recoverWith {
        case NonFatal(error) =>
          if (attemptsRemaining <= 1) Future.failed(error)
          else after(retryDelay, scheduler)(loop(attemptsRemaining - 1))
      }
    }
    loop(attempts)
  }

}
