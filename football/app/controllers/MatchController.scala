package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }
import conf.FootballClient
import pa.FootballMatch
import org.joda.time.format.DateTimeFormat
import feed._
import pa.LineUp
import scala.Some
import implicits.{ Requests, Football }
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends MetaData with Football {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  override lazy val canonicalUrl = None
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

object MatchController extends Controller with Football with Requests with Logging {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderMatchId(matchId: String) = render(Competitions.findMatch(matchId))

  def renderMatch(year: String, month: String, day: String, home: String, away: String) = {

    val date = dateFormat.parseDateTime(year + month + day).toDateMidnight

    (TeamMap.findTeamIdByUrlName(home), TeamMap.findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) => render(Competitions.matchFor(date, homeId, awayId))
      case _ => render(None)
    }
  }

  private def render(maybeMatch: Option[FootballMatch]) = Action { implicit request =>
    maybeMatch.map { theMatch =>
      val promiseOfLineup = Future(FootballClient.lineUp(theMatch.id))
      Async {
        promiseOfLineup.map { lineUp =>
          Cached(60) {
            request.getParameter("callback").map { callback =>
              JsonComponent(
                "summary" -> views.html.fragments.matchSummary(theMatch),
                "stats" -> views.html.fragments.matchStats(MatchPage(theMatch, lineUp))
              )
            } getOrElse {
              Cached(60) {
                Ok(Compressed(views.html.footballMatch(MatchPage(theMatch, lineUp))))
              }
            }
          }
        }
      }
    }.getOrElse(NotFound)
  }
}
