package model
import pa._
import org.joda.time.DateMidnight
import pa.LeagueTableEntry
import pa.{Result, MatchDayTeam}


case class Competition(
    id: String,
    url: String,
    fullName: String,
    shortName: String,
    nation: String,
    startDate: Option[DateMidnight] = None,
    matches: Seq[FootballMatch] = Nil,
    leagueTable: Seq[LeagueTableEntry] = Nil,
    showInTeamsList: Boolean = false,
    tableDividers: List[Int] = Nil
) extends implicits.Collections with implicits.Football {

  lazy val hasMatches = matches.nonEmpty
  lazy val hasLiveMatches = matches.exists(_.isLive)
  lazy val hasResults = results.nonEmpty
  lazy val hasFixtures = matches.exists(_.isFixture)
  lazy val hasLeagueTable = leagueTable.nonEmpty
  lazy val hasTeams = teams.nonEmpty

  lazy val matchDates = matches.map(_.date.toDateMidnight).distinct

  lazy val teams = leagueTable.map(_.team).sortBy(_.name)

  lazy val descriptionFullyLoaded = startDate.isDefined

  lazy val results = matches.filter(_.isResult)

  def teamResults(teamId: String): List[PrevResult] = {
    results
      .filter(fmatch => fmatch.homeTeam.id == teamId || fmatch.awayTeam.id == teamId)
      .map(fmatch => PrevResult(fmatch, teamId))
  }
}

case class Group(round: Option[Round], entries: Seq[LeagueTableEntry])

case class Table(competition: Competition, groups: Seq[Group]) {
  lazy val multiGroup = groups.size > 1

  def topOfTableSnippet = {
    val snippet = groups.map(g => g.copy(entries = g.entries.take(4)))
    this.copy(groups = snippet)
  }

  def snippetForTeam(teamId: String) = {

    val snippet = groups.map { g =>
      val length = g.entries.size
      val teamIndex: Int = g.entries.indexWhere(_.team.id == teamId)

      if (teamIndex < 3) g.copy(entries = g.entries.take(5))

      else if (teamIndex > (length - 3)) g.copy(entries = g.entries.takeRight(5))

      else g.copy(entries = g.entries.slice(teamIndex - 2, teamIndex + 3))
    }

    this.copy(groups = snippet)
  }
}

object Table {

  val IsNumber = """(\d+)""".r

  def apply(competition: Competition): Table = {
    val groups = competition.leagueTable
      .groupBy(_.round)
      .map { case (round, table) => Group(round, table) }
      .toSeq.sortBy(_.round.map(_.roundNumber).map {
        case IsNumber(num) => num.toInt
        case other => 0
      })
    Table(competition, groups)
  }
}

case class TeamFixture(competition: Competition, fixture: pa.FootballMatch)

case class StatusSummary(description: String, status: String, homeScore: Option[Int], awayScore: Option[Int])

case class LeagueTableEntryWithForm(stageNumber: String, round: Option[Round], team: LeagueTeam, prevResults: List[PrevResult])
object LeagueTableEntryWithForm {
  def apply(competition: Competition, leagueTableEntry: LeagueTableEntry): LeagueTableEntryWithForm = {
    LeagueTableEntryWithForm(
      leagueTableEntry.stageNumber, leagueTableEntry.round, leagueTableEntry.team,
      competition.teamResults(leagueTableEntry.team.id)
    )
  }
}

case class PrevResult(date: DateMidnight, self: MatchDayTeam, foe: MatchDayTeam, wasHome: Boolean) {
  val scores = self.score.flatMap { selfScore =>
    foe.score.map { foeScore =>
      (selfScore, foeScore)
    }
  }
  val hasResult = scores.isDefined
  val won = scores.exists {  case (selfScore, foeScore) => selfScore > foeScore }
  val drew = scores.exists { case (selfScore, foeScore) => selfScore == foeScore }
  val lost = scores.exists { case (selfScore, foeScore) => selfScore < foeScore }
}
object PrevResult {
  def apply(result: FootballMatch, thisTeamId: String): PrevResult = {
    if (thisTeamId == result.homeTeam.id) PrevResult(result.date, result.homeTeam, result.awayTeam, wasHome = true)
    else PrevResult(result.date, result.awayTeam, result.homeTeam, wasHome = false)
  }
}
