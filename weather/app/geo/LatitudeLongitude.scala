package geo

object LatitudeLongitude {
  val RadiusOfEarthInKm = 6371

  // Taken from http://www.movable-type.co.uk/scripts/latlong.html
  // Returns the haversine distance in km between two points.
  def haversineDistance(p1: LatitudeLongitude, p2: LatitudeLongitude) = {
    val φ1 = p1.latitude.toRadians
    val φ2 = p2.latitude.toRadians
    val Δφ = (p2.latitude - p1.latitude).toRadians
    val Δλ = (p2.longitude - p1.longitude).toRadians

    val a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
    val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    RadiusOfEarthInKm * c
  }

}

case class LatitudeLongitude(latitude: Double, longitude: Double) {
  override def toString = s"$latitude,$longitude"
}
