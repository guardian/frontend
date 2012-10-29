package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }

object CompetitionListController extends Controller with CompetitionListFilters with Logging {

  val page = Page("http://www.guardian.co.uk/", "competitions", "football", "http://content.guardianapis.com/competitions", "Leagues & competitions", "GFE:Football:Leagues & competitions")

  def render = Action { implicit request =>
    Cached(page) {
      Ok(Compressed(views.html.competitions(filters, page)))
    }
  }

}