package model
import pa.{ FootballMatch, Result, Fixture }
import org.joda.time.DateMidnight

case class Competition(
    id: String,
    url: String,
    fullName: String,
    shortName: String,
    nation: String,
    startDate: Option[DateMidnight] = None,
    matches: Seq[FootballMatch] = Nil) {

  lazy val hasMatches = matches.nonEmpty

}