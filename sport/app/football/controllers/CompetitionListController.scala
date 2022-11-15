package football.controllers

import common._
import conf.switches.Switches
import feed.CompetitionsService
import model.ApplicationContext
import play.api.mvc._

class CompetitionListController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with CompetitionListFilters
    with GuLogging
    with ImplicitControllerExecutionContext {

  val page = new FootballPage("football/competitions", "football", "Leagues & competitions")

  val competitionList = List(
    "Internationals",
    "English",
    "European",
    "Scottish",
    "Rest of world",
  )

  def renderCompetitionListJson(): Action[AnyContent] = renderCompetitionList()
  def renderCompetitionList(): Action[AnyContent] =
    Action { implicit request =>
      val htmlResponse = () => football.views.html.competitions(filters, page, competitionList)
      val jsonResponse = () => football.views.html.fragments.competitionsBody(filters, page, competitionList)

      renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    }
}
