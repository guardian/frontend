package geo

import org.scalatest.{Matchers, FlatSpec}

class CitiesLookUpTest extends FlatSpec with Matchers {
  "getLatitudeLongitude" should "return the latitude and longitude of a given city" in {
    CitiesLookUp.getLatitudeLongitude(CityRef(
      "London",
      "GB"
    )) shouldEqual Some(LatitudeLongitude(
      51.5,
      -0.1167
    ))
  }

  "cache" should "parse all of the lines in the CSV" in {
    CitiesLookUp.getCsvLines.count(_.country != "") shouldEqual CitiesLookUp.getGeoIPCityInputStream.getLines().length - 2
  }
}
