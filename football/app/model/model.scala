package model
import pa.{ LeagueTableEntry, FootballMatch, Result, Fixture }
import org.joda.time.DateMidnight
import feed._

case class Competition(
    id: String,
    url: String,
    fullName: String,
    shortName: String,
    nation: String,
    startDate: Option[DateMidnight] = None,
    matches: Seq[FootballMatch] = Nil,
    leagueTable: Seq[LeagueTableEntry] = Nil) {

  lazy val hasMatches = matches.nonEmpty
  lazy val hasLeagueTable = leagueTable.nonEmpty

  lazy val matchDates = matches.map(_.date.toDateMidnight).distinct
}