package commercial.controllers

import common.Logging
import conf.Configuration.commercial.pageViewAnalyticsStream
import conf.switches.Switches
import model.TinyResponse
import play.api.mvc._

import scala.concurrent.ExecutionContext

class PageViewAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  def insert(): Action[Map[String, Seq[String]]] = Action(parse.formUrlEncoded) { implicit request =>
    val stream = Analytics.storeJsonBody(Switches.commercialPageViewAnalytics, pageViewAnalyticsStream, log) _

    request.body.keys.headOption map { analytics =>
      stream(analytics)
    } getOrElse TinyResponse.noContent()
  }
}
