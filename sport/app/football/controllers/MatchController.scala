package football.controllers

import common._
import model.TeamMap.findTeamIdByUrlName
import model._
import conf._
import play.api.libs.json._
import play.api.mvc.{ Controller, Action }
import pa.{LineUpTeam, FootballMatch, LineUp}
import org.joda.time.format.DateTimeFormat
import feed._
import implicits.{ Requests, Football }
import scala.concurrent.Future

case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends StandalonePage with Football with ExecutionContexts {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  def teamHasStats(team: LineUpTeam) =
    ( team.offsides, team.shotsOn, team.shotsOff, team.fouls) match {
      case (0,0,0,0) => false
      case _ => true
    }

  lazy val hasPaStats: Boolean = teamHasStats( lineUp.homeTeam ) && teamHasStats( lineUp.awayTeam )

  private val id = MatchUrl(theMatch)

  private val javascriptConfig: Map[String, JsValue] = Map(
    "footballMatch" -> JsObject(Seq(
      "id" -> JsString(theMatch.id),
      "dateInMillis" -> JsNumber(theMatch.date.getMillis),
      "homeTeam" -> JsString(theMatch.homeTeam.id),
      "awayTeam" -> JsString(theMatch.awayTeam.id),
      "isLive" -> JsBoolean(theMatch.isLive)
    ))
  )
  override val metadata = MetaData.make(
    id = id,
    section = "football",
    webTitle = s"${theMatch.homeTeam.name} ${theMatch.homeTeam.score.getOrElse("")} - ${theMatch.awayTeam.score.getOrElse("")} ${theMatch.awayTeam.name}",
    analyticsName = s"GFE:Football:automatic:match:${theMatch.date.toString("dd MMM YYYY")}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}",
    javascriptConfigOverrides = javascriptConfig
  )
}

object MatchController extends Controller with Football with Requests with Logging with ExecutionContexts {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderMatchIdJson(matchId: String) = renderMatchId(matchId)
  def renderMatchId(matchId: String) = render(Competitions().findMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String) = renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String) =
    (findTeamIdByUrlName(home), findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) =>
        val date = dateFormat.parseDateTime(year + month + day).toLocalDate
        render(Competitions().matchFor(date, homeId, awayId))
      case _ => render(None)
    }

  private def render(maybeMatch: Option[FootballMatch]) = Action.async { implicit request =>
    val response = maybeMatch map { theMatch =>
      val lineup: Future[LineUp] = FootballClient.lineUp(theMatch.id)
      val page: Future[MatchPage] = lineup map { MatchPage(theMatch, _) }

      page map { page =>
        val htmlResponse = () => football.views.html.matchStats.matchStatsPage(page, Competitions().competitionForMatch(theMatch.id))
        val jsonResponse = () => football.views.html.matchStats.matchStatsComponent(page)
        renderFormat(htmlResponse, jsonResponse, page)
      }
    }

    // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
    response.getOrElse(Future.successful(Cached(30){Found("/football/results")}))
  }
}
