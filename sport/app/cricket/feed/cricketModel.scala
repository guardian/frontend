package cricketModel

import cricket.controllers.CricketMatchPage
import cricket.implicits.Cricket._
import football.datetime.DateHelpers
import model.ContentType
import model.Cors.RichRequestHeader
import model.dotcomrendering.DCARUrlHelper
import play.api.libs.json._
import play.api.mvc.RequestHeader

import java.time.{LocalDateTime, ZoneId, ZonedDateTime}

case class Team(name: String, id: String, home: Boolean, lineup: List[String], teamTagId: Option[String])

object Team {
  implicit val writes: OWrites[Team] = Json.writes[Team]
}

case class InningsBatter(
    name: String,
    order: Int,
    ballsFaced: Int,
    runs: Int,
    fours: Int,
    sixes: Int,
    out: Boolean,
    howOut: String,
    onStrike: Boolean,
    nonStrike: Boolean,
) {
  lazy val notOut: Boolean = !out
}

object InningsBatter {
  implicit val writes: OWrites[InningsBatter] = Json.writes[InningsBatter]
}

case class InningsBowler(name: String, order: Int, overs: Int, maidens: Int, runs: Int, wickets: Int, balls: Int)

object InningsBowler {
  implicit val writes: OWrites[InningsBowler] = Json.writes[InningsBowler]
}

case class InningsWicket(order: Int, name: String, runs: Int)

object InningsWicket {
  implicit val writes: OWrites[InningsWicket] = Json.writes[InningsWicket]
}

case class Innings(
    order: Int,
    battingTeam: String,
    runsScored: Int,
    wickets: Int,
    overs: String,
    declared: Boolean,
    forfeited: Boolean,
    description: String,
    batters: List[InningsBatter],
    bowlers: List[InningsBowler],
    fallOfWicket: List[InningsWicket],
    byes: Int,
    legByes: Int,
    noBalls: Int,
    penalties: Int,
    wides: Int,
    extras: Int,
) {
  implicit val writes: OWrites[Innings] = Json.writes[Innings]
  lazy val closed = declared || forfeited || allOut
  lazy val allOut = wickets == 10

  lazy val firstIn: Option[InningsBatter] = batters.find(_.notOut)
  lazy val secondIn: Option[InningsBatter] = {
    batters.filter(_.notOut) match {
      case first :: second :: _ => Some(second)
      case _                    => None
    }
  }
  lazy val lastOut: Option[InningsBatter] = batters.filter(_.out).lastOption
}

object Innings {
  implicit val writes: OWrites[Innings] = Json.writes[Innings]
}

case class MatchWinner(
    winType: String,
    margin: Option[String],
    team: String, // team name
)

object MatchWinner {
  implicit val writes: OWrites[MatchWinner] = Json.writes[MatchWinner]
}

case class MatchResult(
    resultType: String,
    description: Option[String],
    winner: Option[MatchWinner],
)

object MatchResult {
  implicit val writes: OWrites[MatchResult] = Json.writes[MatchResult]
}

case class Match(
    teams: List[Team],
    innings: List[Innings],
    competitionName: String,
    venueName: String,
    result: String,
    currentDay: Int,
    totalDays: Int,
    gameDate: LocalDateTime,
    officials: List[String],
    matchId: String,
    fullResult: Option[MatchResult] = None,
) {
  def homeTeam: Team = teams.filter(_.home).head
  def awayTeam: Team = teams.filter(!_.home).head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == homeTeam.name).sortBy(_.order)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == awayTeam.name).sortBy(_.order)
}

object Match {
  implicit val writes: OWrites[Match] = Json.writes[Match]
}

// *********** Cricket match stats data ***********
case class MatchStats(
    innings: List[Innings],
    teams: List[Team],
    officials: List[String],
)

object MatchStats {
  implicit val writes: OWrites[MatchStats] = Json.writes[MatchStats]

  def apply(matchData: Match): MatchStats = {
    MatchStats(
      innings = matchData.innings,
      teams = matchData.teams,
      officials = matchData.officials,
    )
  }
}

// *********** Cricket match header data ***********
case class InningsOverview(
    battingTeam: String,
    order: Int,
    runs: Int,
    wickets: Int,
    overs: String,
    declared: Boolean,
    allOut: Boolean,
)

object InningsOverview {
  implicit val writes: OWrites[InningsOverview] = Json.writes[InningsOverview]

  // convert heavy Innings type to the lightweight Overview type
  def fromInnings(innings: Innings): InningsOverview = {
    InningsOverview(
      battingTeam = innings.battingTeam,
      order = innings.order,
      runs = innings.runsScored,
      wickets = innings.wickets,
      overs = innings.overs,
      declared = innings.declared,
      allOut = innings.allOut,
    )
  }
}

case class TeamOverview(name: String, id: String, home: Boolean, teamTagId: Option[String])

object TeamOverview {
  implicit val writes: OWrites[TeamOverview] = Json.writes[TeamOverview]
}

case class MatchOverview(
    teamsOverview: List[TeamOverview],
    inningsOverview: List[InningsOverview],
    competitionName: String,
    venueName: String,
    result: String,
    currentDay: Int,
    totalDays: Int,
    gameDate: LocalDateTime,
    matchId: String,
)

object MatchOverview {
  implicit val writes: OWrites[MatchOverview] = Json.writes[MatchOverview]

  def fromMatch(matchData: Match): MatchOverview = {
    MatchOverview(
      teamsOverview = matchData.teams.map(team => TeamOverview(team.name, team.id, team.home, team.teamTagId)),
      inningsOverview = matchData.innings.map(InningsOverview.fromInnings),
      competitionName = matchData.competitionName,
      venueName = matchData.venueName,
      result = matchData.result,
      currentDay = matchData.currentDay,
      totalDays = matchData.totalDays,
      gameDate = matchData.gameDate,
      matchId = matchData.matchId,
    )
  }
}

case class MatchHeader(
    cricketMatch: MatchOverview,
//    competitionName: String, TODO: we currently don't have this but need to retrieve it e.g., "Ashes 2025-26"
    liveURL: Option[String],
    reportURL: Option[String],
    infoURL: String,
)

object MatchHeader extends DCARUrlHelper {
  implicit val writes: OWrites[MatchHeader] = Json.writes[MatchHeader]

  def apply(page: CricketMatchPage, related: Seq[ContentType], date: ZonedDateTime)(implicit
      request: RequestHeader,
  ): MatchHeader = {
    val currentPage = request.getParameter("page").getOrElse("")

    val matchReportUrl = related
      .find(c => c.isArticleType && c.isPage(currentPage))
      .orElse {

        related
          .filter { content =>
            content.isArticleType &&
            content.isMatchReport &&
            !content.isLiveCricket
          }
          .find(content => {
            val matchStart = DateHelpers.startOfDay(
              page.theMatch.gameDate.atZone(ZoneId.of("Europe/London")),
            )
            content.webPublicationDate.toLocalDate == date.toLocalDate &&
            content.webPublicationDate.isAfter(matchStart) // match report always happens after the match starts
          })
      }
      .map(content => getPageUrl(content.metadata.url))

    val liveBlogUrl = related
      .find(c => c.isLiveCricket && c.isPage(currentPage))
      .orElse {
        related.find { content =>
          content.isLiveCricket &&
          (content.webPublicationDate.toLocalDate == date.toLocalDate)
        }
      }
      .map(content => getPageUrl(content.metadata.url))

    println("Marji")
    MatchHeader(
      cricketMatch = MatchOverview.fromMatch(page.theMatch),
      liveURL = liveBlogUrl,
      reportURL = matchReportUrl,
      infoURL = getPageUrl(page.metadata.id),
    )
  }
}
