package controllers

import java.net.URLEncoder

import common._
import conf.Switches
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css
import model.{NoCache, TinyResponse}

object DiagnosticsController extends Controller with Logging {


  def acceptBeaconOptions = postOptions

  def acceptBeacon = Action { implicit request =>
    countsFromQueryString(request)
    TinyResponse.ok
  }

  def js = Action { implicit request =>
    JavaScript.report(request)
    TinyResponse.gif
  }

  def ab = Action { implicit request =>
    AbTests.report(request.queryString)
    TinyResponse.gif
  }

  def analytics(prefix: String) = Action { implicit request =>
    Analytics.report(prefix)
    TinyResponse.gif
  }

  def escape(values: Seq[Option[(String, String)]]) = {
    val lines = values.flatten.map{ case (name, value) => s"$name: $value"}.mkString("\r\n\r\n")
    val body = s"\r\n\r\n\r\n\r\n------------------------------\r\nAdditional technical data about your request - please do not edit:\r\n\r\n$lines\r\n\r\n"
    // URLEncoder is wrong, but it's close enough for percent encoding
    "?body=" + URLEncoder.encode(body, "UTF-8")// + "&subject=Technical%20Feedback"
  }

  def techFeedback() = Action { implicit request =>
    Analytics.report("tech-feedback")
    val uri = request.queryString.get("uri").map(_.fold("")(_+" "+_))
    val uriKV = uri.map(uri => ("URL", uri))
    val width = request.queryString.get("width").map(value => ("Browser width", value.fold("")(_+" "+_)))
    val browser = request.headers.get("User-Agent").map(("User-Agent", _))
    val emailParams = escape(Seq(uriKV, browser, width))
    NoCache(Ok(views.html.feedback(model.Page(request.path, "info", "Thanks for your report", "GFE:Tech Feedback"), emailParams, uri)))
  }

  // e.g.  .../counts?c=pv&c=vv&c=ve
  def analyticsCounts() = Action { implicit request =>
    countsFromQueryString(request)
    TinyResponse.gif
  }

  private def countsFromQueryString(request: Request[AnyContent]): Unit = {
    request.queryString.getOrElse("c", Nil).foreach(Analytics.report)
  }

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def css = Action(jsonParser) { implicit request =>
    if (conf.Switches.CssLogging.isSwitchedOn) {
      Css.report(request.body)
    }
    TinyResponse.noContent()
  }

  def cssOptions = postOptions

  private def postOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
