package controllers

import common._
import conf.Switches
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css
import model.TinyResponse

object DiagnosticsController extends Controller with Logging {

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

  // e.g.  .../counts?c=pv&c=vv&c=ve
  def analyticsCounts() = Action { implicit request =>
    request.queryString.getOrElse("c", Nil).foreach(Analytics.report)
    TinyResponse.gif
  }

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def css = Action(jsonParser) { implicit request =>
    if (conf.Switches.CssLogging.isSwitchedOn) {
      Css.report(request.body)
    }
    TinyResponse.noContent()
  }

  def cssOptions = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
