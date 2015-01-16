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
}
