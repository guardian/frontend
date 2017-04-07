package controllers

import javax.inject.Inject

import common._
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, SectionSummary}
import play.api.data.Form
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import play.api.libs.ws._
import play.api.data.Forms._

class TechFeedbackController @Inject() (ws: WSClient) (implicit context: ApplicationContext) extends Controller with Logging {

  def submitFeedback(path: String) = Action { implicit request =>

    println("Sending an email")

    val feedbackForm = Form(
      tuple(
        "category" -> text,
        "body" -> text,
        "user" -> text
      )
    )

    val (category, body, user) = feedbackForm.bindFromRequest.get

    println("Sending for category: " + category)

    ws.url("https://ubk59f9zj3.execute-api.eu-west-1.amazonaws.com/prod/FeedpipeLambda")
      .post(Json.obj(
        "category" -> category,
        "body" -> body,
        "user" -> user,
        "extra" -> "not yet supported"
      ))

    val page = model.SimplePage(MetaData.make(
      request.path,
      Some(SectionSummary.fromId("info")),
      "Your report has been sent"
    ))

    Cached(900)(RevalidatableResult.Ok(views.html.feedbackSent(page, path)))
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
