package football.controllers

import feed.CompetitionsService
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, Controller}
import common.{ExecutionContexts, Logging}
import model.{ApplicationContext, Cached}
import football.model.CompetitionStage

class WallchartController(competitionsService: CompetitionsService)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  def renderWallchartEmbed(competitionTag: String): Action[AnyContent] = renderWallchart(competitionTag, true)
  def renderWallchart(competitionTag: String, embed: Boolean = false) = Action { implicit request =>
    competitionsService.competitionsWithTag(competitionTag).map { competition =>
      val page = new FootballPage(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} wallchart"
      )
      val competitionStages = new CompetitionStage(competitionsService.competitions).stagesFromCompetition(competition)

      Cached(60) {
        if(embed) RevalidatableResult.Ok(football.views.html.wallchart.embed(page, competition, competitionStages))
        else RevalidatableResult.Ok(football.views.html.wallchart.page(page, competition, competitionStages))
      }
    }.getOrElse(NotFound)
  }

}
