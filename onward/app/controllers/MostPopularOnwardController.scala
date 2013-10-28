package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached

object MostPopularOnwardController extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action.async { implicit request =>
    concurrent.Future( Cached(900) {
      JsonComponent(
        "trails" -> "ok onwards"
      )
    })
  }
}
