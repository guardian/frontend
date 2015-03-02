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

    if (Switches.DoNotTrack.isSwitchedOn && prefix == "pv") {
      // http://en.wikipedia.org/wiki/Do_Not_Track
      request.headers.get("DNT").filter(_.nonEmpty).foreach( _ => Analytics.report("dnt"))
    }

    Analytics.report(prefix)
    TinyResponse.gif
  }

  def escape(uri: Seq[String]) = {
    val uris = uri.fold("")(_+" "+_)
    URLEncoder.encode(s"Problem URL: $uris", "UTF-8")// URLEncoder is wrong, but it's close enough for percent encoding
  }

  def techFeedback() = Action { implicit request =>
    Analytics.report("tech-feedback")
    val emailParams = request.queryString.get("uri").map(uri => s"?body=${escape(uri)}").getOrElse("")
    NoCache(Ok(views.html.feedback(model.Page(request.path, "info", "Thanks for your report", "GFE:Tech Feedback"), emailParams)))
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
