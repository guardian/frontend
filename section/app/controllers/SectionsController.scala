package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }

object SectionsController extends Controller with Logging {

  val page = Page("http://www.guardian.co.uk/", "sections", "sections", "http://content.guardianapis.com/sections", "All sections", "GFE:All sections")

  def render = Action { implicit request =>
    Cached(page) {
      Ok(Compressed(views.html.sections(page)))
    }
  }

}