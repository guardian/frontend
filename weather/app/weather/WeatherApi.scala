package weather

import common.{ResourcesHelper, ExecutionContexts}
import conf.Configuration
import models.{ForecastResponse, LocationResponse, CityId}
import play.api.Play
import play.api.libs.json.{Json, JsValue}
import play.api.libs.ws.WS
import play.api.Play.current
import java.net.{URI, URLEncoder}

import scala.concurrent.Future

object WeatherApi extends ExecutionContexts with ResourcesHelper {
  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(
    throw new RuntimeException("Weather API Key not set")
  )

  private val WeatherCityUrl = "http://api.accuweather.com/currentconditions/v1/"
  private val WeatherAutoCompleteUrl = "http://api.accuweather.com/locations/v1/cities/autocomplete"
  private val WeatherForecastUrl = "http://api.accuweather.com/forecasts/v1/hourly/12hour/"

  private def autocompleteUrl(query: String): String =
    s"$WeatherAutoCompleteUrl?apikey=$weatherApiKey&q=${URLEncoder.encode(query, "utf-8")}"

  private def cityLookUp(cityId: CityId): String =
    s"$WeatherCityUrl${cityId.id}.json?apikey=$weatherApiKey"

  private def forecastLookUp(cityId: CityId): String =
    s"$WeatherForecastUrl${cityId.id}.json?details=true&apikey=$weatherApiKey"

  private def getJson(url: String): Future[JsValue] = {
    if (Play.isTest) {
      Future(Json.parse(slurpOrDie(new URI(url).getPath.stripPrefix("/"))))
    } else {
      WS.url(url).get().filter(_.status == 200).map(_.json)
    }
  }

  def searchForLocations(query: String) =
    getJson(autocompleteUrl(query)).map({ r =>
      Json.fromJson[Seq[LocationResponse]](r).get
    })

  def getWeatherForCityId(cityId: CityId): Future[JsValue] =
    getJson(cityLookUp(cityId))

  def getForecastForCityId(cityId: CityId): Future[Seq[ForecastResponse]] =
    getJson(forecastLookUp(cityId)).map({ r =>
      Json.fromJson[Seq[ForecastResponse]](r).get
    })
}
