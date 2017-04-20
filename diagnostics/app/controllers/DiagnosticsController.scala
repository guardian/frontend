package controllers

import common._
import play.api.mvc._
import model.diagnostics.analytics.Analytics
import model.diagnostics.csp.CSP
import model.diagnostics.commercial.UserReport
import model.TinyResponse
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json.JsObject

class DiagnosticsController extends Controller with Logging {
  val r = scala.util.Random

  def analytics(prefix: String) = Action { implicit request =>
    Analytics.report(prefix)
    TinyResponse.gif
  }

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def csp = Action(jsonParser) { implicit request =>
    if (conf.switches.Switches.CspReporting.isSwitchedOn && r.nextInt(100) == 1) {
      CSP.report(request.body)
    }

    TinyResponse.noContent()
  }

  def cspOptions = postOptions

  def commercialReport = Action(jsonParser) { implicit request =>
    UserReport.report(request.body)

    /** An empty response isn't valid JSON, so we have to return an empty object */
    JsonComponent(JsObject(Nil)).result
  }

  def commercialReports(dateTime: String) = Action { implicit request =>
    // report requests come from browsers, so dateTime is ISO.
    val date = ISODateTimeFormat.dateTime.parseDateTime(dateTime)

    JsonComponent(
      "reports" -> UserReport.getReports(date)
    ).result
  }

  def commercialOptions = postOptions

  def postOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
