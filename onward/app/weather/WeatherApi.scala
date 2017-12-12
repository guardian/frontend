package weather

import java.net.{URI, URLEncoder}

import akka.actor.{ActorSystem, Scheduler}
import common.{Logging, ResourcesHelper}
import conf.Configuration
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import weather.geo.LatitudeLongitude
import weather.models.CityId
import weather.models.accuweather.{ForecastResponse, LocationResponse, WeatherResponse}
import model.ApplicationContext

import scala.concurrent.duration._
import play.api.Mode

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import akka.pattern.after

class WeatherApi(wsClient: WSClient, context: ApplicationContext, actorSystem: ActorSystem)(implicit ec: ExecutionContext) extends ResourcesHelper with Logging {
  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(
    throw new RuntimeException("Weather API Key not set")
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

  private def getJson(url: String): Future[JsValue] = {
    if (context.environment.mode == Mode.Test) {
      Future(Json.parse(slurpOrDie(new URI(url).getPath.stripPrefix("/"))))
    } else {
      getJsonWithRetry(url)
    }
  }

  private def getJsonWithRetry(url: String): Future[JsValue] = {
    WeatherApi.retryWeatherRequest(() => getJsonRequest(url), requestRetryDelay, actorSystem.scheduler, requestRetryMax).recover {
      case NonFatal(error) =>
        log.error(s"Error fetching $url - $error")
        throw error
    }
  }

  private def getJsonRequest(url: String): Future[JsValue] = {
    wsClient
      .url(url)
      .withRequestTimeout(requestTimeout)
      .get()
      .map { response =>
        if(response.status == 200) response.json else throw new RuntimeException(s"Weather API response: $response")
      }
  }

  def searchForLocations(query: String): Future[Seq[LocationResponse]] =
    getJson(autocompleteUrl(query)).map({ r =>
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

object WeatherApi extends Logging {

  def retryWeatherRequest(request: () => Future[JsValue], retryDelay: FiniteDuration, scheduler: Scheduler, attempts: Int)(implicit ec: ExecutionContext): Future[JsValue] = {
    def loop(attemptsRemaining: Int): Future[JsValue] = {
      request().recoverWith {
        case NonFatal(error) =>
          if (attemptsRemaining <= 1) Future.failed(error) else after(retryDelay, scheduler)(loop(attemptsRemaining - 1))
      }
    }
    loop(attempts)
  }

}
