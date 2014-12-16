package weather

import conf.Configuration
import models.{CityId, City}
import play.api.libs.json.JsValue
import play.api.libs.ws.WS

import scala.concurrent.Future

object WeatherApi {
  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(
    throw new RuntimeException("Weather API Key not set")
  )

  val weatherCityUrl: String = "http://api.accuweather.com/currentconditions/v1/"
  val weatherSearchUrl: String = "http://api.accuweather.com/locations/v1/cities/search.json"

  private def weatherUrlForCity(city: City): String =
    s"$weatherSearchUrl?apikey=$weatherApiKey&q=${city.name}"

  private def weatherUrlForCityId(cityId: CityId): String =
    s"$weatherCityUrl${cityId.id}.json?apikey=$weatherApiKey"

  def getCityIdForCity(city: City): Future[Option[CityId]] =
    for (cityJson <- WS.url(weatherUrlForCity(city)).get().map(_.json))
    yield {
      val cities = cityJson.asOpt[List[JsValue]].getOrElse(Nil)
      cities.map(j => (j \ "Key").as[String]).headOption.map(CityId(_))
    }

  def getWeatherForCityId(cityId: CityId): Future[JsValue] =
    WS.url(weatherUrlForCityId(cityId)).get().filter(_.status == 200).map(_.json)
}
