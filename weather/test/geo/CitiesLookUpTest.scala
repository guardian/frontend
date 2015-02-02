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

  it should "not fail because of weird encoding issues" in {
    CitiesLookUp.getLatitudeLongitude(CityRef(
      "Medellín",
      "02",
      "CO"
    )) shouldEqual Some(LatitudeLongitude(
      6.2518,
      -75.5636
    ))
  }

  "cache" should "parse all of the lines in the CSV" in {
    CitiesLookUp.getCsvLines.length shouldEqual CitiesLookUp.getGeoIPCityInputStream.getLines().length - 2
  }
}
