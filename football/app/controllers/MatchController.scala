package controllers

import common._
import feed.Competitions
import model._
import play.api.mvc.{ Controller, Action }
import conf.FootballClient
import pa.{ LineUp, FootballMatch, MatchStats, MatchEvents }
import play.api.libs.concurrent.Akka
import play.api.Play._

case class MatchPage(page: Page, theMatch: FootballMatch, lineUp: LineUp)

object MatchController extends Controller with Logging {

  val page = new Page(
    "http://www.guardian.co.uk", //TODO we do not always have canonical
    "/foo/bar", //todo
    "football",
    "", //todo we do not always have an api url
    "match", //todo
    "......." //TODO
  )

  def render(matchId: String) = Action { implicit request =>

    Competitions.findMatch(matchId).map { theMatch =>

      val promiseOfLineup = Akka.future(FootballClient.lineUp(matchId))

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
