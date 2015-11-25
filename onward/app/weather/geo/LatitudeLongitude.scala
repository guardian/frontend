package weather.geo

case class LatitudeLongitude(latitude: Double, longitude: Double) {
  override def toString = s"$latitude,$longitude"
}
