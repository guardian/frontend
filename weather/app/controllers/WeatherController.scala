package controllers

import common.editions.{Au, Us, Uk}
import common.{Edition, ExecutionContexts}
import conf.Configuration
import play.api.libs.json.JsValue
import play.api.libs.ws.WS
import play.api.mvc.{RequestHeader, Action, Controller}

import scala.concurrent.Future

object WeatherController extends Controller with ExecutionContexts {
  import play.api.Play.current

  val LocationHeader: String = "X-GU-GeoCity"

  val London: CityId = CityId("328328")
  val NewYork: CityId = CityId("349727")
  val Sydney: CityId = CityId("22889")

  case class City(name: String) extends AnyVal
  case class CityId(id: String) extends AnyVal

  lazy val weatherApiKey: String = Configuration.weather.apiKey.getOrElse(throw new RuntimeException("Weather API Key not set"))

  val weatherCityUrl: String = "http://api.accuweather.com/currentconditions/v1/"
  val weatherSearchUrl: String = "http://api.accuweather.com/locations/v1/cities/search.json"

  private def weatherUrlForCity(city: City): String =
   s"$weatherSearchUrl?apikey=$weatherApiKey&q=${city.name}"

  private def weatherUrlForCityId(cityId: CityId): String =
    s"$weatherCityUrl${cityId.id}.json?apikey=$weatherApiKey"

  private def getWeatherForCity(city: City): Future[Option[CityId]] =
    for (cityJson <- WS.url(weatherUrlForCity(city)).get().map(_.json))
    yield {
      val cities = cityJson.asOpt[List[JsValue]].getOrElse(Nil)
      cities.map(j => (j \ "Key").as[String]).headOption.map(CityId)
    }

  private def getWeatherForCityId(cityId: CityId): Future[JsValue] =
    WS.url(weatherUrlForCityId(cityId)).get().filter(_.status == 200).map(_.json)

  private def getCityIdFromRequestEdition(request: RequestHeader): CityId =
    Edition(request) match {
      case Uk => London
      case Us => NewYork
      case Au => Sydney
    }

  private def getCityIdFromRequest(request: RequestHeader): Future[CityId] = {
    lazy val cityIdFromRequestEdition: CityId = getCityIdFromRequestEdition(request)
    request.headers.get(LocationHeader) match {
      case Some(city) =>
        getWeatherForCity(City(city)).map(_.getOrElse(cityIdFromRequestEdition))
      case None => Future.successful(cityIdFromRequestEdition)
    }
  }

  def forCity(name: String) = Action.async {
    getWeatherForCity(City(name)).flatMap {
      case Some(cityId) => getWeatherForCityId(cityId).map(Ok(_))
      case None => Future.successful(NotFound)
    }
  }

  def forRequest() = Action.async { implicit request =>
    getCityIdFromRequest(request).flatMap { cityId =>
      getWeatherForCityId(cityId).map(Ok(_))
    }
  }
}
