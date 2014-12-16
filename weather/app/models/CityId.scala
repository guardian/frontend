package models

import common.Edition
import common.editions.{Au, Us, Uk}
import play.api.mvc.RequestHeader
import weather.WeatherApi

import scala.concurrent.Future

case class City(name: String) extends AnyVal

object CityId {
  val London = CityId("328328")
  val NewYork = CityId("349727")
  val Sydney = CityId("22889")

  val LocationHeader: String = "X-GU-GeoCity"

  def fromEdition(edition: Edition): CityId =
    edition match {
      case Uk => London
      case Us => NewYork
      case Au => Sydney
    }

  def fromRequest(request: RequestHeader): Future[CityId] = {
    lazy val cityIdFromRequestEdition: CityId = fromEdition(Edition(request))
    request.headers.get(LocationHeader) match {
      case Some(city) =>
        WeatherApi.getCityIdForCity(City(city)).map(_.getOrElse(cityIdFromRequestEdition))
      case None => Future.successful(cityIdFromRequestEdition)
    }
  }
}

case class CityId(id: String) extends AnyVal
