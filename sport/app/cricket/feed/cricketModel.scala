package cricketModel

import com.github.nscala_time.time.Imports.DateTimeZone
import football.datetime.DateHelpers
import cricket.implicits.Cricket._
import model.ContentType
import model.Cors.RichRequestHeader
import model.dotcomrendering.DotcomRenderingUtils.getPageUrl
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
) {
  def homeTeam: Team = teams.filter(_.home).head
  def awayTeam: Team = teams.filter(!_.home).head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == homeTeam.name).sortBy(_.order)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == awayTeam.name).sortBy(_.order)

  def lastInnings: Option[Innings] = innings.lastOption

  def firstInBatter: Option[InningsBatter] = lastInnings.flatMap(_.firstIn)

  def secondInBatter: Option[InningsBatter] = lastInnings.flatMap(_.secondIn)

  def lastOut: Option[InningsBatter] = lastInnings.flatMap(_.lastOut)
}

object Match {
  implicit val writes: OWrites[Match] = Json.writes[Match]
}

case class MatchHeader(
    cricketMatch: Match,
    competitionName: String, // e.g., "Ashes 2025-26"
    liveURL: Option[String],
    reportURL: Option[String],
)

object MatchHeader {
  implicit val writes: OWrites[MatchHeader] = Json.writes[MatchHeader]

  def apply(theMatch: Match, related: Seq[ContentType], date: ZonedDateTime)(implicit
      request: RequestHeader,
  ): MatchHeader = {
    val currentPage = request.getParameter("page").getOrElse("")

    val matchReport = related
      .find(c => c.isArticleType && c.isPage(currentPage))
      .orElse {
        related.find { content =>
          val webPublicationDate =
            DateHelpers.asZonedDateTime(content.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")))

          content.isArticleType &&
          !content.isLiveCricket &&
          (webPublicationDate.toLocalDate == date.toLocalDate ||
            webPublicationDate.isAfter(DateHelpers.startOfDay(date)))
        }
      }
      .map(content => getPageUrl(content.metadata.url))

    val liveBlog = related
      .find(c => c.isLiveCricket && c.isPage(currentPage))
      .orElse {
        related
          .find { c =>
            val webPublicationDate =
              DateHelpers.asZonedDateTime(c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")))

            c.isLiveCricket &&
            (webPublicationDate.toLocalDate == date.toLocalDate ||
              webPublicationDate.isAfter(theMatch.gameDate.atZone(ZoneId.of("Europe/London"))))
          }
      }
      .map(content => getPageUrl(content.metadata.url))

    MatchHeader(theMatch, "", liveBlog, matchReport)
  }
}
