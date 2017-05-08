package football.controllers

import common._
import conf._
import feed.CompetitionsService
import implicits.{Football, Requests}
import model.Cached.WithoutRevalidationResult
import model.TeamMap.findTeamIdByUrlName
import model._
import org.joda.time.format.DateTimeFormat
import pa.{FootballMatch, LineUp, LineUpTeam}
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, Controller}

import scala.concurrent.Future

case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends StandalonePage with Football with ExecutionContexts {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  def teamHasStats(team: LineUpTeam): Boolean =
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
    section = Some(SectionSummary.fromId("football")),
    webTitle = s"${theMatch.homeTeam.name} ${theMatch.homeTeam.score.getOrElse("")} - ${theMatch.awayTeam.score.getOrElse("")} ${theMatch.awayTeam.name}",
    javascriptConfigOverrides = javascriptConfig
  )
}

class MatchController(competitionsService: CompetitionsService)(implicit context: ApplicationContext) extends Controller with Football with Requests with Logging with ExecutionContexts {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderMatchIdJson(matchId: String): Action[AnyContent] = renderMatchId(matchId)
  def renderMatchId(matchId: String): Action[AnyContent] = render(competitionsService.findMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] = renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    (findTeamIdByUrlName(home), findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) =>
        val date = dateFormat.parseDateTime(year + month + day).toLocalDate
        render(competitionsService.matchFor(date, homeId, awayId))
      case _ => render(None)
    }

  private def render(maybeMatch: Option[FootballMatch]) = Action.async { implicit request =>
    val response = maybeMatch map { theMatch =>
      val lineup: Future[LineUp] = competitionsService.footballClient.lineUp(theMatch.id).recover(competitionsService.footballClient.logErrors)
      val page: Future[MatchPage] = lineup map { MatchPage(theMatch, _) }

      page map { page =>
        val htmlResponse = () => football.views.html.matchStats.matchStatsPage(page, competitionsService.competitionForMatch(theMatch.id))
        val jsonResponse = () => football.views.html.matchStats.matchStatsComponent(page)
        renderFormat(htmlResponse, jsonResponse, page)
      }
    }

    // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
    response.getOrElse(Future.successful(Cached(30)(WithoutRevalidationResult(Found("/football/results")))))
  }
}
