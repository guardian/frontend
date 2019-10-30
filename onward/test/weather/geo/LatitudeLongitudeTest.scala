package weather.geo

import org.scalatest.{FlatSpec, Matchers, OptionValues}

class LatitudeLongitudeTest
  extends FlatSpec
    with Matchers
    with OptionValues {

  behavior of "LatitudeLongitude"

  it should "successfully parse a valid lat/long string" in {
    val latLongString = "51.498,-0.102"

    val latLong = LatitudeLongitude.fromString(latLongString)

    latLong.value should be(LatitudeLongitude(51.498, -0.102))
  }

  it should "return None for a nonsense lat/long string" in {
    val badLatLongString = "blah blah"

    val latLong = LatitudeLongitude.fromString(badLatLongString)

    latLong should be(None)
  }

  it should "return None for an invalid lat/long string" in {
    val badLatLongString = "51.498,-0.102,45.123"

    val latLong = LatitudeLongitude.fromString(badLatLongString)

    latLong should be(None)
  }

  it should "set the accuracy to city level (2 d.p.)" in {
    val latLong = LatitudeLongitude(51.468, -0.112)

    val lessGranularLatLong = LatitudeLongitude.toCityAccuracy(latLong)

    lessGranularLatLong should be(LatitudeLongitude(51.47, -0.11))
  }
}
