package controllers.admin.commercial

import common.dfp.LineItemReport
import model.ApplicationContext
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import tools.Store

class SlotController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController {

  def viewSlot(slotName: String): Action[AnyContent] =
    Action { implicit request =>
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
