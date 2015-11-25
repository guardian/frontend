package weather.models

import common.Edition
import common.editions.{Au, Us, Uk}
import weather.models.accuweather.LocationResponse
import play.api.libs.json.Json

import scalaz.std.AllInstances._
import scalaz.syntax.foldable._

object CityResponse {
  implicit val jsonWrites = Json.writes[CityResponse]

  def fromLocationResponses(locations: List[LocationResponse]) = {
    def cityAndCountry(location: LocationResponse) =
      (location.LocalizedName, location.Country.LocalizedName)

    val citiesWithSameNameByCountry = locations.map({ location => Map(cityAndCountry(location) -> 1) }).suml

    locations.map { location =>
      val needsDisambiguating = citiesWithSameNameByCountry.get(cityAndCountry(location)).exists(_ > 1)

      val cityName = if (needsDisambiguating)
        s"${location.LocalizedName}, ${location.AdministrativeArea.LocalizedName}"
      else
        location.LocalizedName

      CityResponse(
        location.Key,
        cityName,
        location.Country.LocalizedName
      )
    }
  }

  def fromLocationResponse(location: LocationResponse) = {
    CityResponse(
      location.Key,
      location.LocalizedName,
      location.Country.LocalizedName
    )
  }

  val London = CityResponse(
    id = "328328",
    city = "London",
    country = "England"
  )

  val NewYork = CityResponse(
    id = "349727",
    city = "New York",
    country = "US"
  )

  val Sydney = CityResponse(
    id = "22889",
    city = "Sydney",
    country = "Australia"
  )

  def fromEdition(edition: Edition) = {
    edition match {
      case Uk => London
      case Us => NewYork
      case Au => Sydney
    }
  }
}

case class CityResponse(
  id: String,
  city: String,
  country: String
)
