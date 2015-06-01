package controllers

import java.net.URLEncoder

import common._
import model.Cached
import model.Cached
import play.api.mvc.{Content => _, _}

object TechFeedbackController extends Controller with Logging {

  def escape(values: Seq[Option[(String, String)]]) = {
    val lines = values.flatten.map { case (name, value) => s"$name: $value" }.mkString("\r\n\r\n")
    val body = s"\r\n\r\n\r\n\r\n------------------------------\r\nAdditional technical data about your request - please do not edit:\r\n\r\n$lines\r\n\r\n"
    // URLEncoder is wrong, but it's close enough for percent encoding
    "?body=" + URLEncoder.encode(body, "UTF-8")
  }

  def techFeedback() = Action { implicit request =>
    Cached(900)(Ok(views.html.feedback(model.Page(request.path, "info", "Thanks for your report", "GFE:Tech Feedback"))))
  }

}
