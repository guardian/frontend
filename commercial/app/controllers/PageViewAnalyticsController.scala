package commercial.controllers

import common.Logging
import conf.Configuration.commercial.pageViewAnalyticsStream
import conf.switches.Switches
import play.api.mvc._

import scala.concurrent.ExecutionContext

class PageViewAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  private val stream = Analytics.storeJsonBody(Switches.pageViewAnalytics, pageViewAnalyticsStream, log) _

  def store(): Action[String] = Action(parse.text) { implicit request =>
    stream(request)
  }
}
