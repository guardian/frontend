package commercial.controllers

import common.JsonComponent
import common.dfp.DfpAgent
import model.{Cached, Cors}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.duration._

class nonRefreshableLineItemsController(val controllerComponents: ControllerComponents)
    extends BaseController
    with implicits.Requests {

  def getIds: Action[AnyContent] =
    Action { implicit request =>
      val nonRefreshableLineItems: Seq[Long] = DfpAgent.nonRefreshableLineItemIds()
      Cors(
        Cached(15.minutes) {
          JsonComponent.fromWritable(nonRefreshableLineItems)
        },
        None,
        None,
        Seq("localhost"),
      )
    }
}
