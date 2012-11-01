package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import play.api.templates.Html

object FrontScoresController extends Controller with Logging {

  /*
   * Finds the first competition with matches on today in a list of competition ids passed in
   */
  def render() = Action { implicit request =>
    val competitionIds = request.queryString("competitionId")
    val todaysCompetitions = Competitions.withTodaysMatches.competitions

    //keep competitions in same order as passed in ids
    val competition = competitionIds.flatMap(id => todaysCompetitions.find(_.id == id)).headOption
    competition.map { comp =>
      Cached(60) {
        val html = views.html.fragments.frontMatchBlock(comp)
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
