package controllers

import conf.Configuration
import common._
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, NoCache, SectionSummary}
import play.api.data.Form
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import play.api.libs.ws._
import play.api.data.Forms._

import scala.concurrent.duration._

class TechFeedbackController(ws: WSClient) (implicit context: ApplicationContext) extends Controller with Logging {

  def submitFeedback(path: String) = Action { implicit request =>

    val feedbackForm = Form(
      tuple(
        "category" -> text,
        "body" -> text,
        "user" -> text,
        "extra" -> text,
        "name" -> text
      )
    )

    val (category, body, user, extra, name) = feedbackForm.bindFromRequest.get

    log.info(s"feedback submitted for category: $category")

    ws.url(Configuration.feedback.feedpipeEndpoint)
      .withRequestTimeout(6000.millis)
      .post(Json.obj(
        "category" -> java.net.URLEncoder.encode(category, "UTF-8"),
        "body" -> java.net.URLEncoder.encode(body, "UTF-8"),
        "user" -> java.net.URLEncoder.encode(user, "UTF-8"),
        "extra" -> java.net.URLEncoder.encode(extra, "UTF-8"),
        "name" -> java.net.URLEncoder.encode(name, "UTF-8")
      ))

    val page = model.SimplePage(MetaData.make(
      request.path,
      Some(SectionSummary.fromId("info")),
      "Your report has been sent"
    ))

    NoCache(Ok(views.html.feedbackSent(page, path)))

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
