package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }

object StyleGuideController extends Controller with Logging {

  def renderIndex = Action { implicit request =>
    val page = Page(canonicalUrl = None, "style-guide", "style-guide", "Style guide", "GFE:Style-guide")
    Cached(60) {
      Ok(Compressed(views.html.index(page)))
    }
  }

  def renderBase(path: String) = Action { implicit request =>
    val page = Page(canonicalUrl = None, "style-guide", "style-guide", "Style guide", "GFE:Style-guide")
    Cached(60) {
      Ok(Compressed(views.html.index(page)))
    }
  }
}
