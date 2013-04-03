package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.libs.concurrent.Execution.Implicits._

object FrontScoresController extends Controller with implicits.Football with Logging {

  /*
   * Finds the first competition with matches on today in a list of competition ids passed in
   */
  def render() = Action { implicit request =>
    val competitionIds = request.queryString("competitionId")

    val numVisible = request.getIntParameter("numVisible").getOrElse(0)
    val isCompetitionPage = request.getBooleanParameter("competitionPage").getOrElse(false)

    val todaysCompetitions = Competitions.withTodaysMatches.competitions

    //keep competitions in same order as passed in ids but prefer home nation friendlies
    val competition = todaysCompetitions.find(_.matches.exists(_.isHomeNationGame)).orElse(
      competitionIds.flatMap(id => todaysCompetitions.find(_.id == id)).headOption
    )

    competition.map { comp =>
      Cached(60) {
        val html = views.html.fragments.frontMatchBlock(comp, numVisible, isCompetitionPage)
        request.getQueryString("callback").map { callback =>
          JsonComponent(html)
        } getOrElse {
          Cached(60) {
            Ok(Compressed(html))
          }
        }
      }
    } getOrElse (NoContent)
  }
}
