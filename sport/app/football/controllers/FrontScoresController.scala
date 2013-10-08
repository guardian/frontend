package football.controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }


object FrontScoresController extends Controller with implicits.Football with Logging with ExecutionContexts {

  /*
   * Finds the first competition with matches on today in a list of competition ids passed in
   */
  def renderFrontScoresJson() = renderFrontScores()
  def renderFrontScores() = Action { implicit request =>
    val competitionIds = request.queryString("competitionId")

    val numVisible = request.getIntParameter("numVisible").getOrElse(0)
    val isCompetitionPage = request.getBooleanParameter("competitionPage").getOrElse(false)

    val todaysCompetitions = Competitions().withTodaysMatches.competitions

    //keep competitions in same order as passed in ids but prefer home nation friendlies
    val competition = todaysCompetitions.find(_.matches.exists(_.isHomeNationGame)).orElse(
      competitionIds.flatMap(id => todaysCompetitions.find(_.id == id)).headOption
    )

    competition.map { comp =>
      val html = () => football.views.html.fragments.frontMatchBlock(comp, numVisible, isCompetitionPage)
      renderFormat(html, html, 60)
    } getOrElse NoContent
  }
}
