package weather.geo

case class LatitudeLongitude(latitude: Double, longitude: Double) {
  override def toString: String = s"$latitude,$longitude"
}

object LatitudeLongitude {
  def fromStringAnonymised(latLong: String): Option[LatitudeLongitude] = {
    val coords = latLong.split(",").map(value => Math.round(value.toDouble * 100)/100.0)
    if (coords.length == 2) {
      Some(LatitudeLongitude(coords(0), coords(1)))
    } else None
  }
}
