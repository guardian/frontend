package weather.geo

import common.ResourcesHelper

import scala.io.{BufferedSource, Source}
import scala.util.Try

case class CityRef(city: String, region: String, country: String)

object CityRef {
  def makeFixedCase(city: String, region: String, country: String): CityRef =
    CityRef(city.toUpperCase(), region.toUpperCase(), country.toUpperCase())
}

object CitiesCsvLine {
  implicit class RichString(s: String) {
    def withoutQuotes: String = s.stripPrefix("\"").stripSuffix("\"")
  }

  def unapply(line: String): Option[CitiesCsvLine] = {
    line.split(",", -1) match {
      case Array(
            geonamesId,
            city,
            region,
            country,
            latitude,
            longitude,
          ) =>
        Try {
          CitiesCsvLine(
            geonamesId.toInt,
            city.withoutQuotes,
            region.withoutQuotes,
            country.withoutQuotes,
            latitude.toDouble,
            longitude.toDouble,
          )
        }.toOption

      case _ => None
    }
  }
}

case class CitiesCsvLine(
    geonamesId: Int,
    city: String,
    region: String,
    country: String,
    latitude: Double,
    longitude: Double,
)

object CitiesLookUp extends ResourcesHelper {
  private[geo] def getGeoIPCityInputStream: BufferedSource = {
    Source.fromInputStream(getInputStream("city_region_country_lat_long.csv").get, "iso-8859-1")
  }

  private[geo] def getCsvLines: Iterator[CitiesCsvLine] = {
    val csv = getGeoIPCityInputStream
    // first line is field names
    csv.getLines().drop(1) collect { case CitiesCsvLine(csvLine) => csvLine }
  }

  def loadCache(): Map[CityRef, LatitudeLongitude] = {
    getCsvLines
      .filter({ csvLine =>
        csvLine.country.nonEmpty && csvLine.city.nonEmpty
      })
      .map({ csvLine =>
        CityRef.makeFixedCase(csvLine.city, csvLine.region, csvLine.country) -> LatitudeLongitude(
          csvLine.latitude,
          csvLine.longitude,
        )
      })
      .foldLeft(Map.empty[CityRef, LatitudeLongitude]) {
        case (acc, kv) => acc + kv
      }
  }

  private[geo] val cache = loadCache()

  def getLatitudeLongitude(reference: CityRef): Option[LatitudeLongitude] = cache.get(reference)
}
