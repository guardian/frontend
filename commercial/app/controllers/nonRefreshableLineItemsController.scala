package commercial.controllers

import common.JsonComponent
import common.dfp.DfpAgent
import model.Cached
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.duration._

class nonRefreshableLineItemsController(val controllerComponents: ControllerComponents)
    extends BaseController
    with implicits.Requests {

  def getIds: Action[AnyContent] =
    Action { implicit request =>
      val nonRefreshableLineItems: Seq[Long] = DfpAgent.nonRefreshableLineItemIds()
      val json = Json.toJson(nonRefreshableLineItems)
      Cached(15.minutes) {
        JsonComponent(json)
      }
    }
}
