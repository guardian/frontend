package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }

object SectionsController extends Controller with Logging {

  val page = Page(canonicalUrl = None, "sections", "sections", "All sections", "GFE:All sections")

  def render = Action { implicit request =>
    Cached(page) {
      Ok(Compressed(views.html.sections(page)))
    }
  }

}