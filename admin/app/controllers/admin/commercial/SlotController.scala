package controllers.admin.commercial

import common.dfp.LineItemReport
import conf.Configuration.environment
import controllers.admin.AuthActions
import play.api.libs.json.Json
import play.api.mvc.Controller
import tools.Store

object SlotController extends Controller {

  def viewSlot(slotName: String) = AuthActions.AuthActionTest {
    val maybeResult = for {
      jsonString <- Store.getSlotTakeoversReport(slotName)
      report = Json.parse(jsonString).as[LineItemReport]
    } yield slotName match {
        case "top" =>
          Ok(views.html.commercial.slotTop(environment.stage, report))
        case "top-above-nav" =>
          Ok(views.html.commercial.slotTopAboveNav(environment.stage, report))
        case "top-below-nav" =>
          Ok(views.html.commercial.slotTopBelowNav(environment.stage, report))
        case _ => InternalServerError("Missing template")
      }
    maybeResult getOrElse Ok("No data available.")
  }
}
