package weather.geo

import scala.util.Try

case class LatitudeLongitude(latitude: Double, longitude: Double) {
  override def toString: String = s"$latitude,$longitude"
}

object LatitudeLongitude {
  def fromString(latLong: String): Option[LatitudeLongitude] = {
    val splitLatLong = latLong.split(",")

    if (splitLatLong.length != 2) {
      None
    } else {
      Try {
        val latitude = splitLatLong(0).toDouble
        val longitude = splitLatLong(1).toDouble

        LatitudeLongitude(latitude, longitude)
      }.toOption
    }
  }

  def toCityAccuracy(latLong: LatitudeLongitude): LatitudeLongitude = {
    val roundTo2dp = (value: Double) => BigDecimal(value)
      .setScale(2, BigDecimal.RoundingMode.HALF_UP)
      .toDouble

    LatitudeLongitude(roundTo2dp(latLong.latitude), roundTo2dp(latLong.longitude))
  }
}
