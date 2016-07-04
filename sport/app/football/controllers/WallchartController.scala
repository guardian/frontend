package football.controllers

import feed.Competitions
import model.Cached.RevalidatableResult
import play.api.mvc.{ Action, Controller }
import common.{ExecutionContexts, Logging}
import model.{Cached, Page}
import football.model.CompetitionStage


class WallchartController extends Controller with Logging with ExecutionContexts {
  def renderWallchartEmbed(competitionTag: String) = renderWallchart(competitionTag, true)
  def renderWallchart(competitionTag: String, embed: Boolean = false) = Action { implicit request =>
    Competitions().withTag(competitionTag).map { competition =>
      val page = new FootballPage(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} wallchart",
        "GFE:Football:automatic:wallchart"
      )
      val competitionStages = CompetitionStage.stagesFromCompetition(competition)

      Cached(60) {
        if(embed) RevalidatableResult.Ok(football.views.html.wallchart.embed(page, competition, competitionStages))
        else RevalidatableResult.Ok(football.views.html.wallchart.page(page, competition, competitionStages))
      }
    }.getOrElse(NotFound)
  }

}

object WallchartController extends WallchartController
