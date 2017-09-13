package controllers

import common._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import model.diagnostics.analytics.Analytics
import model.diagnostics.commercial.UserReport
import model.TinyResponse
import org.joda.time.format.ISODateTimeFormat

class DiagnosticsController(val controllerComponents: ControllerComponents) extends BaseController  with Logging {
  val r = scala.util.Random

  def analytics(prefix: String) = Action { implicit request =>
    Analytics.report(prefix)
    TinyResponse.gif
  }

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def commercialReport = Action(jsonParser) { implicit request =>
    UserReport.report(request.body)

    TinyResponse.noContent()
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
