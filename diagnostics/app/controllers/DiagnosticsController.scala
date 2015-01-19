package controllers

import common._
import model.NoCache
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css

object DiagnosticsController extends Controller with Logging {

  def js = Action { implicit request =>
    JavaScript.report(request)
    TinyResponse()
  }

  def ab = Action { implicit request =>
    AbTests.report(request.queryString)
    TinyResponse()
  }

  def analytics(prefix: String) = Action {
    Analytics.report(prefix)
    TinyResponse()
  }

  // e.g.  .../counts?c=pv&c=vv&c=ve
  def analyticsCounts() = Action { request =>
    request.queryString.getOrElse("c", Nil).foreach(Analytics.report)
    TinyResponse()
  }

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def css = Action(jsonParser) { request =>
    if (conf.Switches.CssLogging.isSwitchedOn) {
      Css.report(request.body)
    }
    NoCache(Ok("OK"))
  }

}
