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
    OnePix()
  }

  def ab = Action { implicit request =>
    AbTests.report(request.queryString)
    OnePix()
  }

  def analytics(prefix: String) = Action {
    Analytics.report(prefix)
    OnePix()
  }

  // e.g.  .../counts?c=pv&c=vv&c=ve
  def analyticsCounts() = Action { request =>
    request.queryString.getOrElse("c", Nil).foreach(Analytics.report)
    OnePix()
  }

  def css = Action { request =>
    request.body.asJson.map { jsonBody =>
      if (conf.Switches.CssLogging.isSwitchedOn) {
        Css.report(jsonBody)
      }
      NoCache(Ok("OK"))
    } getOrElse {
      NoCache(BadRequest)
    }
  }

}
