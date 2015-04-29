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
    "?body=" + URLEncoder.encode(body, "UTF-8") // + "&subject=Technical%20Feedback"
  }

  def techFeedback(stage: String) = Action { implicit request =>
    //     if (request.method == "POST")
    //       Analytics.report("tech-feedback")
//    val uri = request.queryString.get("uri").map(_.fold("")(_ + " " + _))
//    val uriKV = uri.map(uri => ("URL", uri))
//    val width = request.queryString.get("width").map(value => ("Browser width", value.fold("")(_ + " " + _)))
//    val browser = request.headers.get("User-Agent").map(("User-Agent", _))
//    val emailParams = escape(Seq(uriKV, browser, width))
    Cached(900)(Ok(views.html.feedback(model.Page(request.path, "info", "Thanks for your report", "GFE:Tech Feedback"))))
  }

}
