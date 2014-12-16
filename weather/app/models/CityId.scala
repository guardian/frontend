package models

case class City(name: String) extends AnyVal

object CityId {
  val London = CityId("328328")
  val NewYork = CityId("349727")
  val Sydney = CityId("22889")
}

case class CityId(id: String) extends AnyVal
