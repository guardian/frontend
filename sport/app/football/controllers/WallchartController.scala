package football.controllers

import feed.CompetitionsService
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import common.{ImplicitControllerExecutionContext, Logging}
import model.{ApplicationContext, Cached}
import football.model.{CompetitionStage, KnockoutSpider}

class WallchartController(
  competitionsService: CompetitionsService,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderWallchartEmbed(competitionTag: String): Action[AnyContent] = renderWallchart(competitionTag, true)
  def renderWallchart(competitionTag: String, embed: Boolean = false): Action[AnyContent] = Action { implicit request =>
    competitionsService.competitionsWithTag(competitionTag).map { competition =>
      val page = new FootballPage(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} wallchart"
      )
      val competitionStages = new CompetitionStage(competitionsService.competitions)
        .stagesFromCompetition(competition, KnockoutSpider.orderings)

      Cached(60) {
        if(embed) RevalidatableResult.Ok(football.views.html.wallchart.embed(page, competition, competitionStages))
        else RevalidatableResult.Ok(football.views.html.wallchart.page(page, competition, competitionStages))
      }
    }.getOrElse(NotFound)
  }

}
