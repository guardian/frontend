package football.controllers

import common._
import model._
import conf._
import play.api.mvc.{ Controller, Action }
import pa.FootballMatch
import org.joda.time.format.DateTimeFormat
import feed._
import pa.LineUp
import implicits.{ Requests, Football }
import scala.concurrent.Future


case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends MetaData with Football with ExecutionContexts {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  override lazy val id = MatchUrl(theMatch)
  override lazy val section = "football"
  override lazy val webTitle = s"${theMatch.homeTeam.name} ${theMatch.homeTeam.score.getOrElse("")} - ${theMatch.awayTeam.score.getOrElse("")} ${theMatch.awayTeam.name}"

  override lazy val analyticsName = s"GFE:Football:automatic:match:${theMatch.date.toString("dd MMM YYYY")}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}"

  override lazy val metaData: Map[String, Any] = super.metaData + (
    "footballMatch" -> Map(
      "id" -> theMatch.id,
      "dateInMillis" -> theMatch.date.getMillis,
      "homeTeam" -> theMatch.homeTeam.id,
      "awayTeam" -> theMatch.awayTeam.id,
      "isLive" -> theMatch.isLive
    )
  )
}

object MatchController extends Controller with Football with Requests with Logging with ExecutionContexts {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderMatchIdJson(matchId: String) = renderMatchId(matchId)
  def renderMatchId(matchId: String) = render(Competitions().findMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String) = renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String) = {

    val date = dateFormat.parseDateTime(year + month + day).toDateMidnight

    (TeamMap.findTeamIdByUrlName(home), TeamMap.findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) => render(Competitions().matchFor(date, homeId, awayId))
      case _ => render(None)
    }
  }

  private def render(maybeMatch: Option[FootballMatch]) = Action.async { implicit request =>
    val response = maybeMatch map { theMatch =>
      val lineup: Future[LineUp] = FootballClient.lineUp(theMatch.id)
      val page: Future[MatchPage] = lineup map { MatchPage(theMatch, _) }

      page map { page =>
        val htmlResponse = () => football.views.html.footballMatch(page)
        val jsonResponse = () => football.views.html.fragments.footballMatchBody(page)
        renderFormat(htmlResponse, jsonResponse, page, Switches.all)
      }
    }

    response.getOrElse(Future { NotFound })
  }
}
