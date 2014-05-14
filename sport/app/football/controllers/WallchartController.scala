package football.controllers

import feed.Competitions
import play.api.mvc.{ Action, Controller }
import common.{ExecutionContexts, Logging}
import model.{Cached, Page}
import football.model.CompetitionStage


object WallchartController extends Controller with Logging with ExecutionContexts {
  def renderWallchartEmbed(competitionTag: String) = renderWallchart(competitionTag, true)
  def renderWallchart(competitionTag: String, embed: Boolean = false) = Action { implicit request =>
    Competitions().withTag(competitionTag).map { competition =>
      val page = new Page(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} wallchart",
        "GFE:Football:automatic:wallchart"
      )
      val competitionStages = CompetitionStage.stagesFromCompetition(competition)

      Cached(60) {
        if(embed) Ok(football.views.html.wallchart.embed(page, competition, competitionStages))
        else Ok(football.views.html.wallchart.page(page, competition, competitionStages))
      }
    }.getOrElse(NotFound)
  }


  def renderR2FrontWorldCupEmbed() = Action { implicit request =>
    conf.Switches.WorldCupWallchartEmbedSwitch.isSwitchedOn
    Competitions().withTag("world-cup-2014").map { competition =>
      val page = new Page(
        competition.url.stripSuffix("/"),
        "football",
        s"${competition.fullName} temp embed",
        "GFE:Football:automatic:r2-front-world-cup-embed"
      )
      val competitionStages = CompetitionStage.stagesFromCompetition(competition)
      Cached(60){Ok(football.views.html.wallchart.r2FrontWorldCupEmbed(page, competition, competitionStages))}
    }.getOrElse(NotFound)
  }
}
