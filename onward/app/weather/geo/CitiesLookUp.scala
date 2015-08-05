package weather.geo

import common.ResourcesHelper
import scala.io.Source
import scala.util.Try

case class CityRef(city: String, region: String, country: String)

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
  private [geo] def getGeoIPCityInputStream = {
    Source.fromInputStream(getInputStream("GeoIPCity-534-Location.csv").get, "iso-8859-1")
  }

  private[geo] def getCsvLines = {
    val csv = getGeoIPCityInputStream
    csv.getLines().drop(2) collect { case CitiesCsvLine(csvLine) => csvLine }
  }

  def loadCache() = {
    // first two lines are Copyright info and field names
    getCsvLines.filter({ csvLine =>
      !csvLine.country.isEmpty && !csvLine.city.isEmpty
    }).map({ csvLine =>
      CityRef(csvLine.city, csvLine.region, csvLine.country) -> LatitudeLongitude(csvLine.latitude, csvLine.longitude)
    }).foldLeft(Map.empty[CityRef, LatitudeLongitude]) {
      case (acc, kv) => acc + kv
    }
  }

  private[geo] val cache = loadCache()

  def getLatitudeLongitude(reference: CityRef): Option[LatitudeLongitude] = cache.get(reference)
}
