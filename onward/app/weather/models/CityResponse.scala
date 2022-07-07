package weather.models

import common.Edition
import common.editions.{Au, Uk, Us}
import weather.models.accuweather.LocationResponse
import play.api.libs.json.Json

object CityResponse {
  implicit val jsonWrites = Json.writes[CityResponse]

  def fromLocationResponses(locations: List[LocationResponse]): Seq[CityResponse] = {
    def cityAndCountry(location: LocationResponse): (String, String) =
      (location.LocalizedName, location.Country.LocalizedName)

    val citiesWithSameNameByCountry = locations.foldLeft(Map.empty[(String, String), Int]) { (accumulation, location) =>
      val key = cityAndCountry(location)
      accumulation + (key -> (accumulation.getOrElse(key, 0) + 1))
    }

    locations.map { location =>
      val needsDisambiguating = citiesWithSameNameByCountry.get(cityAndCountry(location)).exists(_ > 1)

      val cityName =
        if (needsDisambiguating)
          s"${location.LocalizedName}, ${location.AdministrativeArea.LocalizedName}"
        else
          location.LocalizedName

      CityResponse(
        location.Key,
        cityName,
        location.Country.LocalizedName,
      )
    }
  }

  def fromLocationResponse(location: LocationResponse): CityResponse = {
    CityResponse(
      location.Key,
      location.LocalizedName,
      location.Country.LocalizedName,
    )
  }

  val London = CityResponse(
    id = "328328",
    city = "London",
    country = "England",
  )

  val NewYork = CityResponse(
    id = "349727",
    city = "New York",
    country = "US",
  )

  val Sydney = CityResponse(
    id = "22889",
    city = "Sydney",
    country = "Australia",
  )

  def fromEdition(edition: Edition): Option[CityResponse] = {
    edition match {
      case Uk => Some(London)
      case Us => Some(NewYork)
      case Au => Some(Sydney)
      case _  => None
    }
  }
}

case class CityResponse(
    id: String,
    city: String,
    country: String,
)
