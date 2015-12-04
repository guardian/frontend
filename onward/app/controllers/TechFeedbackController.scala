package controllers

import common._
import model.{MetaData, Cached}
import play.api.mvc.{Action, Controller}

object TechFeedbackController extends Controller with Logging {

  def techFeedback(path: String) = Action { implicit request =>
    val page = model.SimplePage(MetaData.make(request.path, "info", "Thanks for your report", "GFE:Tech Feedback"))
    Cached(900)(Ok(views.html.feedback(page, path)))
  }

}
