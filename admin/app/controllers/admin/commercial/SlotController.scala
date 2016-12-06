package controllers.admin.commercial

import common.dfp.LineItemReport
import play.api.Environment
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import tools.Store

class SlotController(implicit env: Environment) extends Controller {

  def viewSlot(slotName: String) = Action { implicit request =>
    val maybeResult = for {
      jsonString <- Store.getSlotTakeoversReport(slotName)
      report = Json.parse(jsonString).as[LineItemReport]
    } yield slotName match {
        case "top" =>
          Ok(views.html.commercial.slotTop(report))
        case "top-above-nav" =>
          Ok(views.html.commercial.slotTopAboveNav(report))
        case _ => InternalServerError("Missing template")
      }
    maybeResult getOrElse Ok("No data available.")
  }
}
