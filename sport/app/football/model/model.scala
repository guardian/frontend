package model

import pa._
import org.joda.time.LocalDate
import pa.LeagueTableEntry
import pa.MatchDayTeam
import java.awt.Color

case class Competition(
    id: String,
    url: String,
    fullName: String,
    shortName: String,
    nation: String,
    startDate: Option[LocalDate] = None,
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

  lazy val matchDates = matches.map(_.date.toLocalDate).distinct

  lazy val teams = leagueTable.map(_.team).sortBy(_.name)

  lazy val descriptionFullyLoaded = startDate.isDefined

  lazy val results = matches.filter(_.isResult)

  def teamResults(teamId: String): List[PrevResult] = {
    results
      .filter(fmatch => fmatch.homeTeam.id == teamId || fmatch.awayTeam.id == teamId)
      .map(fmatch => PrevResult(fmatch, teamId))
  }
}

case class Group(round: Round, entries: Seq[LeagueTableEntry])

case class Table(competition: Competition, groups: Seq[Group], hasGroups: Boolean = false) {
  lazy val multiGroup = hasGroups || groups.size > 1

  def topOfTableSnippet: Table = {
    val snippet = groups.map(g => g.copy(entries = g.entries.take(4)))
    this.copy(groups = snippet)
  }

  def snippetForTeam(teamId: String): Table = {

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
      .toSeq.sortBy(_.round.roundNumber match {
        case IsNumber(num) => num.toInt
        case other => 0
      })
    Table(competition, groups)
  }
}

case class TeamFixture(competition: Competition, fixture: pa.FootballMatch)

case class StatusSummary(description: String, status: String, homeScore: Option[Int], awayScore: Option[Int])

case class LeagueTableEntryWithForm(stageNumber: String, round: Round, team: LeagueTeam, prevResults: List[PrevResult])
object LeagueTableEntryWithForm {
  def apply(competition: Competition, leagueTableEntry: LeagueTableEntry): LeagueTableEntryWithForm = {
    LeagueTableEntryWithForm(
      leagueTableEntry.stageNumber, leagueTableEntry.round, leagueTableEntry.team,
      competition.teamResults(leagueTableEntry.team.id)
    )
  }
}

case class PrevResult(date: LocalDate, self: MatchDayTeam, foe: MatchDayTeam, wasHome: Boolean) {
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

case class TeamColours(homeTeam: LineUpTeam, awayTeam: LineUpTeam) {
  private val darkenFactor = 0.3
  private val homeColour =
    if (homeTeam.teamColour.isEmpty) "#ffffff"
    else homeTeam.teamColour.toLowerCase
  private val awayColour =
    if (awayTeam.teamColour.isEmpty) "#ffffff"
    else awayTeam.teamColour.toLowerCase

  lazy val home = homeColour
  lazy val away =
    if (awayColour == "#ffffff" && homeColour == "#ffffff") darken(awayColour)
    else if (awayColour == homeColour) darken(awayColour)
    else awayColour
  lazy val homeTeamIsLight = isLight(home)
  lazy val awayTeamIsLight = isLight(away)

  private def isLight(colourHex: String): Boolean = {
    val colour = Color.decode(colourHex)
    val yiq = ((colour.getRed*299) + (colour.getGreen*587) + (colour.getBlue*114)) / 1000
    yiq > 128
  }

  private def darken(colour: String): String = {
    val original = Color.decode(colour)
    val darker = new Color(
      Math.max(original.getRed * (1 - darkenFactor), 0).round.toInt,
      Math.max(original.getGreen * (1 - darkenFactor), 0).round.toInt,
      Math.max(original.getBlue * (1 - darkenFactor), 0).round.toInt
    )
    "#%02x%02x%02x".format(darker.getRed, darker.getGreen, darker.getBlue)
  }
}
