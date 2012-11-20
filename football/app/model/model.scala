package model
import pa._
import org.joda.time.DateMidnight
import pa.LeagueTableEntry

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

case class Group(round: Option[Round], entries: Seq[LeagueTableEntry])

case class Table(competition: Competition, groups: Seq[Group]) {
  lazy val multiGroup = groups.size > 1
}

object Table {
  def apply(competition: Competition): Table = {
    val groups = competition.leagueTable
      .groupBy(_.round)
      .map { case (round, table) => Group(round, table) }
      .toSeq.sortBy(_.round.map(_.roundNumber).getOrElse(""))
    Table(competition, groups)
  }
}