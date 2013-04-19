package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._

object CompetitionListController extends Controller with CompetitionListFilters with Logging {

  val page = Page(canonicalUrl = None, "football/competitions", "football", "Leagues & competitions", "GFE:Football:automatic:Leagues & competitions")

  def render = Action { implicit request =>

    val competitionList = List(
      "English",
      "European",
      "Scottish",
      "Internationals",
      "Rest of world"
    )

    Cached(page) {
      Ok(Compressed(views.html.competitions(filters, page, competitionList)))
    }
  }

}