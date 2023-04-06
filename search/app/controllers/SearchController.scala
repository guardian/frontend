package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.{BaseController, ControllerComponents}

import scala.concurrent.Future

class SearchController(
    contentApiClient: ContentApiClient,
    ws: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def search() = {
    Action.async(Future.successful(Ok("ok")))
  }
}
