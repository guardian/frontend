package controllers

import common._
import play.api.mvc._
import model.diagnostics.javascript.JavaScript
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css
import model.TinyResponse

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
    if (conf.switches.Switches.CssLogging.isSwitchedOn) {
      Css.report(request.body)
    }
    TinyResponse.noContent()
  }

  def cssOptions = postOptions

  private def postOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
