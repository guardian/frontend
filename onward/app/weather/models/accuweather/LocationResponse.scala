package weather.models.accuweather

import common.Edition
import common.editions.{Au, Uk, Us}
import play.api.libs.json.{Json, Writes}

/* Not all the fields the AccuWeather API returns, but the ones we care about */

object LocationName {
  implicit val jsonReads = Json.reads[LocationName]

  implicit val writes = new Writes[LocationName] {
    def writes(model: LocationName) = {
      Json.obj(
        "id" -> model.ID,
        "localizedName" -> model.LocalizedName,
      )
    }
  }
}

case class LocationName(
    ID: String,
    LocalizedName: String,
)

object LocationResponse {
  implicit val jsonReads = Json.reads[LocationResponse]

  implicit val writes = new Writes[LocationResponse] {
    def writes(model: LocationResponse) = {
      Json.obj(
        "Key" -> model.Key,
        "localizedName" -> model.LocalizedName,
        "country" -> model.Country,
        "administrativeArea" -> model.AdministrativeArea,
        "type" -> model.Type,
      )
    }
  }

  def fromEdition(edition: Edition): Option[LocationResponse] = {
    edition match {
      case Uk => Some(London)
      case Us => Some(NewYork)
      case Au => Some(Sydney)
      case _  => None
    }
  }

  private val London = LocationResponse(
    Key = "328328",
    LocalizedName = "London",
    Country = LocationName("", "England"),
    AdministrativeArea = LocationName("", "England"),
    Type = "",
  )

  private val NewYork = LocationResponse(
    Key = "349727",
    LocalizedName = "New York",
    Country = LocationName("", "US"),
    AdministrativeArea = LocationName("", "England"),
    Type = "",
  )

  private val Sydney = LocationResponse(
    Key = "22889",
    LocalizedName = "Sydney",
    Country = LocationName("", "Australia"),
    AdministrativeArea = LocationName("", "England"),
    Type = "",
  )
}

case class LocationResponse(
    Key: String,
    LocalizedName: String,
    Country: LocationName,
    AdministrativeArea: LocationName,
    Type: String,
)
