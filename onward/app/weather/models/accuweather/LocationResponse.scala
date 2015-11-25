package weather.models.accuweather

import play.api.libs.json.Json

/* Not all the fields the AccuWeather API returns, but the ones we care about */

object LocationName {
  implicit val jsonReads = Json.reads[LocationName]
}

case class LocationName(
  ID: String,
  LocalizedName: String
)

object LocationResponse {
  implicit val jsonReads = Json.reads[LocationResponse]
}

case class LocationResponse(
  Key: String,
  LocalizedName: String,
  Country: LocationName,
  AdministrativeArea: LocationName,
  Type: String
)
