package weather

import java.net.{URI, URLEncoder}

import common.{ExecutionContexts, ResourcesHelper}
import conf.Configuration
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WS
import weather.geo.LatitudeLongitude
import weather.models.CityId
import weather.models.accuweather.{ForecastResponse, LocationResponse, WeatherResponse}

import scala.concurrent.Future

object WeatherApi extends ExecutionContexts with ResourcesHelper {
  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(
    throw new RuntimeException("Weather API Key not set")
  )

  private def autocompleteUrl(query: String): String =
    s"http://api.accuweather.com/locations/v1/cities/autocomplete?apikey=$weatherApiKey&q=${URLEncoder.encode(query, "utf-8")}"

  private def cityLookUp(cityId: CityId): String =
    s"http://api.accuweather.com/currentconditions/v1/${cityId.id}.json?apikey=$weatherApiKey"

  private def forecastLookUp(cityId: CityId): String =
    s"http://api.accuweather.com/forecasts/v1/hourly/24hour/${cityId.id}.json?details=true&apikey=$weatherApiKey"

  private def latitudeLongitudeUrl(latitudeLongitude: LatitudeLongitude): String = {
    s"http://api.accuweather.com/locations/v1/cities/geoposition/search.json?q=$latitudeLongitude&apikey=$weatherApiKey"
  }

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

  def getNearestCity(latitudeLongitude: LatitudeLongitude) =
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
