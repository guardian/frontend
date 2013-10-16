package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts

object SimpleAdvert extends Controller with ExecutionContexts {

  def render(path: String) = Action { implicit request =>
    Ok(views.html.simpleAdvert(path))  
  }

}
