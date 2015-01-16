package geo

import common.ResourcesHelper
import scala.io.Source
import scala.util.Try

case class CityRef(city: String, country: String)

object CitiesCsvLine {
  implicit class RichString(s: String) {
    def withoutQuotes = s.stripPrefix("\"").stripSuffix("\"")
  }

  def unapply(line: String): Option[CitiesCsvLine] = {
    line.split(",", -1) match {
      case Array(
        locationId,
        country,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        metroCode,
        areaCode
      ) =>
        println("hi")

        Try {
          CitiesCsvLine(
            locationId.toInt,
            country.withoutQuotes,
            region.withoutQuotes,
            city.withoutQuotes,
            postalCode.withoutQuotes,
            latitude.toDouble,
            longitude.toDouble,
            metroCode.withoutQuotes,
            areaCode.withoutQuotes
          )
        }.toOption

      case _ => None
    }
  }
}

case class CitiesCsvLine(
  locId: Int,
  country: String,
  region: String,
  city: String,
  postalCode: String,
  latitude: Double,
  longitude: Double,
  metroCode: String,
  areaCode: String
)

object CitiesLookUp extends ResourcesHelper {
  def loadCache() = {
    val cache = Source.fromInputStream(getInputStream("GeoIPCity-534-Location.csv").get, "UTF-8")

    // first two lines are Copyright info and field names
    (cache.getLines().drop(2) collect {
      case CitiesCsvLine(csvLine) if !csvLine.country.isEmpty && !csvLine.city.isEmpty =>
        CityRef(csvLine.city, csvLine.country) -> LatitudeLongitude(csvLine.latitude, csvLine.longitude)
    }).foldLeft(Map.empty[CityRef, LatitudeLongitude]) {
      case (acc, kv) => acc + kv
    }
  }

  private val cache = loadCache()

  def getLatitudeLongitude(reference: CityRef): Option[LatitudeLongitude] = cache.get(reference)
}
