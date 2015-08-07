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
    } yield Ok(views.html.commercial.slot(environment.stage, slotName, report))
    maybeResult getOrElse Ok("No data available.")
  }
}
