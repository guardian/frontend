package geo

import org.scalatest.{Matchers, FlatSpec}

class CitiesLookUpTest extends FlatSpec with Matchers {
  "getLatitudeLongitude" should "return the latitude and longitude of a given city" in {
    CitiesLookUp.getLatitudeLongitude(CityRef(
      "London",
      "H9",
      "GB"
    )) shouldEqual Some(LatitudeLongitude(
      51.5142,
      -0.0931
    ))
  }

  "cache" should "parse all of the lines in the CSV" in {
    CitiesLookUp.getCsvLines.length shouldEqual CitiesLookUp.getGeoIPCityInputStream.getLines().length - 2
  }
}
