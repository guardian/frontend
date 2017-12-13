package controllers

import common._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import model.diagnostics.UserReport
import model.TinyResponse
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json.JsValue

class DiagnosticsController(val controllerComponents: ControllerComponents) extends BaseController  with Logging {
  val r = scala.util.Random

  private lazy val jsonParser = parse.tolerantJson(1024 *1024)

  def commercialReport: Action[JsValue] = Action(jsonParser) { implicit request =>
    UserReport.report(request.body)

    TinyResponse.noContent()
  }

  def commercialReports(dateTime: String): Action[AnyContent] = Action { implicit request =>
    // report requests come from browsers, so dateTime is ISO.
    val date = ISODateTimeFormat.dateTime.parseDateTime(dateTime)

    JsonComponent(
      "reports" -> UserReport.getReports(date)
    ).result
  }

  def commercialOptions: Action[AnyContent] = postOptions

  def postOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }
}
