package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }

object StyleGuideController extends Controller with Logging {

  def renderIndex = Action { implicit request =>
    Cached(60) {
      Ok(Compressed(views.html.index()))
    }
  }

  def renderBase(path: String) = Action { implicit request =>
    val view = views.base. + path + ()
        Cached(60) {
      Ok(Compressed(view))
    }
  }
}
