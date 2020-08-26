package rugby.controllers

import common._
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, SectionId, StandalonePage}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.twirl.api.Html
import rugby.jobs.RugbyStatsJob
import rugby.model.Match

case class MatchPage(liveScore: Match) extends StandalonePage {
  override val metadata = MetaData.make(
    id =
      s"/sport/rugby/api/score/${liveScore.date.toString("yyyy/MMM/dd")}/${liveScore.homeTeam.id}/${liveScore.awayTeam.id}",
    section = Some(SectionId.fromId("rugby")),
    webTitle = s"${liveScore.homeTeam.name} v ${liveScore.awayTeam.name}",
  )
}

class MatchesController(
    rugbyStatsJob: RugbyStatsJob,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Logging
    with ImplicitControllerExecutionContext {

  def scoreJson(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String): Action[AnyContent] =
    score(year, month, day, homeTeamId, awayTeamId)

  def score(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] =
    Action { implicit request =>
      val matchOpt = rugbyStatsJob.getFixturesAndResultScore(year, month, day, team1, team2)
      val currentPage = request.getParameter("page")

      matchOpt
        .map { aMatch =>
          val matchNav =
            rugbyStatsJob.getMatchNavContent(aMatch).map(rugby.views.html.fragments.matchNav(_, currentPage).toString)

          val page = MatchPage(aMatch)
          Cached(60) {
            if (request.isJson)
              JsonComponent(
                "matchSummary" -> rugby.views.html.fragments.matchSummary(page, aMatch).toString,
                "dropdown" -> views.html.fragments.dropdown("", isClientSideTemplate = true)(Html("")),
                "nav" -> matchNav.getOrElse(""),
              )
            else
              RevalidatableResult.Ok(rugby.views.html.matchSummary(page, aMatch))
          }

        }
        .getOrElse(NotFound)
    }
}
