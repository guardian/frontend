package geo

import org.scalatest.{Matchers, FlatSpec}

class LatitudeLongitudeTest extends FlatSpec with Matchers {
  "haversineDistance" should "return the haversine distance between two points" in {
    Math.floor(LatitudeLongitude.haversineDistance(
      LatitudeLongitude(
        40.7486,
        -73.9864
      ),
      LatitudeLongitude(
        58.643889,
        3.07
      )
    )) shouldEqual 5535
  }
}
