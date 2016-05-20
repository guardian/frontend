package controllers

import common._
import org.joda.time.Instant
import play.api.mvc._
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css
import model.diagnostics.csp.CSP
import model.TinyResponse

object DiagnosticsController extends Controller with Logging {
  val r = scala.util.Random

  def acceptBeaconOptions = postOptions

  def acceptBeacon = Action { implicit request =>
    countsFromQueryString(request)
    TinyResponse.ok
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

  def csp = Action(jsonParser) { implicit request =>
    if (conf.switches.Switches.CspReporting.isSwitchedOn && r.nextInt(100) == 1) {
      CSP.report(request.body)
    }

    TinyResponse.noContent()
  }

  def postOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
