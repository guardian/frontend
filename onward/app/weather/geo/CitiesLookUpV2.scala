package weather.geo

import common.ResourcesHelper

import scala.io.{BufferedSource, Source}
import scala.util.Try

case class CityRefV2(city: String, region: String, country: String)

object CityRefV2 {
  def makeFixedCase(city: String, region: String, country: String): CityRefV2 =
    CityRefV2(city.toUpperCase(), region.toUpperCase(), country.toUpperCase())
}

object CitiesCsvLineV2 {
  implicit class RichString(s: String) {
    def withoutQuotes: String = s.stripPrefix("\"").stripSuffix("\"")
  }

  def unapply(line: String): Option[CitiesCsvLineV2] = {
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
          CitiesCsvLineV2(
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

case class CitiesCsvLineV2(
    geonamesId: Int,
    city: String,
    region: String,
    country: String,
    latitude: Double,
    longitude: Double,
)

object CitiesLookUpV2 extends ResourcesHelper {
  private[geo] def getGeoIPCityInputStream: BufferedSource = {
    Source.fromInputStream(getInputStream("city_region_country_lat_long.csv").get, "iso-8859-1")
  }

  private[geo] def getCsvLines: Iterator[CitiesCsvLineV2] = {
    val csv = getGeoIPCityInputStream
    // first line is field names
    csv.getLines().drop(1) collect { case CitiesCsvLineV2(csvLine) => csvLine }
  }

  def loadCache(): Map[CityRefV2, LatitudeLongitude] = {
    getCsvLines
      .filter({ csvLine =>
        csvLine.country.nonEmpty && csvLine.city.nonEmpty
      })
      .map({ csvLine =>
        CityRefV2.makeFixedCase(csvLine.city, csvLine.region, csvLine.country) -> LatitudeLongitude(
          csvLine.latitude,
          csvLine.longitude,
        )
      })
      .foldLeft(Map.empty[CityRefV2, LatitudeLongitude]) {
        case (acc, kv) => acc + kv
      }
  }

  private[geo] val cache = loadCache()

  def getLatitudeLongitude(reference: CityRefV2): Option[LatitudeLongitude] = cache.get(reference)
}
