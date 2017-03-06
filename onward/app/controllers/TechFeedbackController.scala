package controllers

import common._
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, SectionSummary}
import play.api.mvc.{Action, Controller}

class TechFeedbackController (implicit context: ApplicationContext) extends Controller with Logging {

  def submitFeedback(path: String) = Action { implicit request =>
    val page = model.SimplePage(MetaData.make(
      request.path,
      Some(SectionSummary.fromId("info")),
      "Your report has been sent"
    ))
    Cached(900)(RevalidatableResult.Ok(views.html.feedback(page, path)))
  }

  def techFeedback(path: String) = Action { implicit request =>
    val page = model.SimplePage(MetaData.make(
      request.path,
      Some(SectionSummary.fromId("info")),
      "Thanks for your report"
    ))
    Cached(900)(RevalidatableResult.Ok(views.html.feedback(page, path)))
  }

}
