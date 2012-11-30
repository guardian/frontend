package controllers

import common._
import feed.Competitions
import model._
import play.api.mvc.{ Controller, Action }
import conf.FootballClient
import pa.{ LineUp, FootballMatch, MatchStats, MatchEvents }
import play.api.libs.concurrent.Akka
import play.api.Play._
import org.joda.time.format.DateTimeFormat
import feed._

case class MatchPage(page: Page, theMatch: FootballMatch, lineUp: LineUp) {
  lazy val hasLiveMatch = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty
}

object MatchController extends Controller with Logging {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  val page = new Page(
    "http://www.guardian.co.uk", //TODO we do not always have canonical
    "/foo/bar", //todo
    "football",
    "", //todo we do not always have an api url
    "match", //todo
    "......." //TODO
  )

  def renderMatchId(matchId: String) = render(Competitions.findMatch(matchId))

  def renderMatch(year: String, month: String, day: String, home: String, away: String) = {

    val date = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val homeTeam = TeamMap.teams.find(_._2.url == "/football/" + home).map(_._2)
    val awayTeam = TeamMap.teams.find(_._2.url == "/football/" + away).map(_._2)
    (homeTeam, awayTeam) match {
      case (Some(Team(homeId, _, _, _)), Some(Team(awayId, _, _, _))) =>
        render(Competitions.matchFor(date, homeId, awayId))
      case _ => render(None)
    }
  }

  private def render(maybeMatch: Option[FootballMatch]) = Action { implicit request =>
    maybeMatch.map { theMatch =>
      val promiseOfLineup = Akka.future(FootballClient.lineUp(theMatch.id))

      Async {
        promiseOfLineup.map { lineUp =>
          Cached(60) {
            Ok(views.html.footballMatch(MatchPage(page, theMatch, lineUp)))
          }
        }
      }
    }.getOrElse(NotFound)
  }
}
