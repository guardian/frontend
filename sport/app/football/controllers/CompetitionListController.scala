package controllers

import common._
import model._
import conf._
import play.api.mvc.{ Controller, Action }


object CompetitionListController extends Controller with CompetitionListFilters with Logging with ExecutionContexts {

  val page = Page("football/competitions", "football", "Leagues & competitions", "GFE:Football:automatic:Leagues & competitions")

  def renderJson() = render()
  def render = Action { implicit request =>

    val competitionList = List(
      "English",
      "European",
      "Scottish",
      "Internationals",
      "Rest of world"
    )
    
    val htmlResponse = () => football.views.html.competitions(filters, page, competitionList)
    val jsonResponse = () => football.views.html.fragments.competitionsBody(filters, page, competitionList)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    
  }

}