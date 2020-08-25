package controllers

import java.lang.Throwable

import common._
import conf.Configuration
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, NoCache, SectionId, SimplePage}
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws._
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._

class TechFeedbackController(ws: WSClient, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with Logging
    with ImplicitControllerExecutionContext {

  def submitFeedback(path: String): Action[AnyContent] =
    Action { implicit request =>
      val feedbackForm = Form(
        tuple(
          "category" -> text,
          "subject" -> text,
          "body" -> text,
          "user" -> text,
          "extra" -> text,
          "name" -> text,
        ),
      )

      val (category, subject, body, user, extra, name) = feedbackForm.bindFromRequest.get

      log.info(s"feedback submitted for category: $category")

      val payload = Json.obj(
        "category" -> java.net.URLEncoder.encode(category, "UTF-8"),
        "subject" -> java.net.URLEncoder.encode(subject, "UTF-8"),
        "body" -> java.net.URLEncoder.encode(body, "UTF-8"),
        "user" -> java.net.URLEncoder.encode(user, "UTF-8"),
        "extra" -> java.net.URLEncoder.encode(extra, "UTF-8"),
        "name" -> java.net.URLEncoder.encode(name, "UTF-8"),
      )

      ws.url(Configuration.feedback.feedpipeEndpoint)
        .withRequestTimeout(6000.millis)
        .post(payload)

      val page = model.SimplePage(
        MetaData.make(
          request.path,
          Some(SectionId.fromId("info")),
          "Your report has been sent",
        ),
      )

      NoCache(Ok(views.html.feedbackSent(page, path)))

    }

  def techFeedback(path: String): Action[AnyContent] = {

    Action.async { implicit request =>
      def getAlerts: Future[List[String]] =
        ws.url(Configuration.feedback.feedbackHelpConfig)
          .withRequestTimeout(3000.millis)
          .get()
          .map((resp: WSResponse) => (Json.parse(resp.body) \ "alerts").get.as[List[String]])

      def pageWithAlerts(alerts: List[String]): Result = {
        val page: SimplePage = model.SimplePage(
          MetaData.make(
            request.path,
            Some(SectionId.fromId("info")),
            "Thanks for your report",
          ),
        )
        Cached(60)(
          RevalidatableResult.Ok(
            views.html.feedback(
              page,
              path,
              alerts,
            ),
          ),
        )
      }

      getAlerts.map {
        pageWithAlerts
      } recover {
        case t: Throwable =>
          log.error("Failed to get alerts", t)
          pageWithAlerts(Nil)
      }

    }

  }

}
