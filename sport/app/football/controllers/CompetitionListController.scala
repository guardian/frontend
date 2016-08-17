package football.controllers

import common._
import conf.switches.Switches
import feed.CompetitionsService
import play.api.mvc.{Action, Controller}


class CompetitionListController(val competitionsService: CompetitionsService) extends Controller with CompetitionListFilters with Logging with ExecutionContexts {

  val page = new FootballPage("football/competitions", "football", "Leagues & competitions", "GFE:Football:automatic:Leagues & competitions")

  val competitionList = List(
    "English",
    "European",
    "Scottish",
    "Internationals",
    "Rest of world"
  )

  def renderCompetitionListJson() = renderCompetitionList()
  def renderCompetitionList() = Action { implicit request =>
    val htmlResponse = () => football.views.html.competitions(filters, page, competitionList)
    val jsonResponse = () => football.views.html.fragments.competitionsBody(filters, page, competitionList)

    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }
}

