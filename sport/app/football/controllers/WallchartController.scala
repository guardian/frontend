package football.controllers

import feed.CompetitionsService
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import common.{ImplicitControllerExecutionContext, JsonComponent, GuLogging}
import model.{ApplicationContext, Cached}
import football.model.{CompetitionStage, KnockoutSpider}
import org.joda.time.DateTime
import pa.FootballMatch

class WallchartController(
    competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderWallchartEmbed(competitionTag: String): Action[AnyContent] = renderWallchart(competitionTag, true)
  def renderWallchart(competitionTag: String, embed: Boolean = false): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .map { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} wallchart",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)

          val nextMatch = WallchartController.nextMatch(competition.matches, DateTime.now())
          Cached(60) {
            if (embed)
              RevalidatableResult.Ok(
                football.views.html.wallchart.embed(page, competition, competitionStages, nextMatch),
              )
            else
              RevalidatableResult.Ok(
                football.views.html.wallchart.page(page, competition, competitionStages, nextMatch),
              )
          }
        }
        .getOrElse(NotFound)
    }

  def renderWallchartJson(competitionTag: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService.competitionsWithTag(competitionTag) match {
        case Some(competition) if KnockoutSpider.orderings.contains(competition.id) => {
          new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)
            .collectFirst({ case spider: KnockoutSpider => spider })
            .map(spider =>
              Cached(60) {
                JsonComponent(football.views.html.wallchart.wallchartComponent(competition, spider))
              },
            )
            .getOrElse(NotFound)
        }
        case _ => NotFound
      }
    }
}

object WallchartController {
  def nextMatch(matches: Seq[FootballMatch], after: DateTime): Option[FootballMatch] = {
    val ordered = matches.sortBy(_.date.getMillis)
    ordered.find(game => game.date.isAfter(after))
  }
}
