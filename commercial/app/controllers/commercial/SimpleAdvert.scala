package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts

object SimpleAdvert extends Controller with ExecutionContexts {

  def render(path: String) = Action { implicit request =>
    path match {
      case "jobs" => Ok(views.html.jobs(path))  
      case "masterclasses" => Ok(views.html.masterclasses(path))  
      case "soulmates" => Ok(views.html.soulmates(path))
      case _ => NotFound
    }
  }

}
