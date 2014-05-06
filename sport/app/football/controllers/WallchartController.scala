package football.controllers

import feed.Competitions
import play.api.mvc.{ Action, Controller }
import common.{ExecutionContexts, Logging}
import model.{Cached, Page}
import football.model.CompetitionStage


object WallchartController extends Controller with Logging with ExecutionContexts {
  def renderWallchart(competitionTag: String) = Action { implicit request =>
    Competitions().withTag(competitionTag).map { competition =>
      val page = new Page(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} wallchart",
        "GFE:Football:automatic:wallchart"
      )
      val competitionStages = CompetitionStage.stagesFromCompetition(competition)
      Cached(300) {
        Ok(football.views.html.wallchart.wallchart(page, competition, competitionStages))
      }
    }.getOrElse(NotFound)
  }
}
