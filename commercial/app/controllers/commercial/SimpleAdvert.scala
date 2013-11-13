package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts

object SimpleAdvert extends Controller with ExecutionContexts {

  def render(path: String) = Action { implicit request =>
    path match {
      case "masterclasses" => Ok(views.html.masterclasses(path))
      case _ => NotFound
    }
  }

}
