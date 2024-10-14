package commercial.controllers

import common.GuLogging
import conf.Configuration.commercial.prebidAnalyticsStream
import conf.switches.Switches
import play.api.mvc._

import scala.concurrent.ExecutionContext

class PrebidAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with GuLogging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  def insert(): Action[String] =
    Action(parse.text) { implicit request =>
      Analytics.storeJsonBody(Switches.prebidAnalytics, prebidAnalyticsStream, log)(request.body)
    }
}
