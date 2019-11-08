package weather.geo

case class LatitudeLongitude(latitude: Double, longitude: Double) {
  override def toString: String = s"$latitude,$longitude"
}
