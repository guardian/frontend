package model
import pa.{ Result, Fixture }
import org.joda.time.DateMidnight

case class Competition(
    id: String,
    url: String,
    fullName: String,
    shortName: String,
    startDate: Option[DateMidnight] = None,
    fixtures: Seq[Fixture] = Nil,
    results: Seq[Result] = Nil) {
  lazy val hasFixtures = fixtures.nonEmpty
  lazy val hasResults = results.nonEmpty
}
