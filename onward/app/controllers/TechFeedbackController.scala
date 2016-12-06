package controllers

import common._
import model.Cached.RevalidatableResult
import model.{Cached, MetaData, SectionSummary}
import play.api.Environment
import play.api.mvc.{Action, Controller}

class TechFeedbackController (implicit env: Environment) extends Controller with Logging {

  def techFeedback(path: String) = Action { implicit request =>
    val page = model.SimplePage(MetaData.make(
      request.path,
      Some(SectionSummary.fromId("info")),
      "Thanks for your report"
    ))
    Cached(900)(RevalidatableResult.Ok(views.html.feedback(page, path)))
  }

}
