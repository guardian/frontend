package model
import pa.Fixture

case class Competition(id: String, url: String, fullName: String, shortName: String, fixtures: Seq[Fixture] = Nil) {
  lazy val hasFixture = fixtures.nonEmpty
}
