package controllers.admin

import common.{AkkaAsync, GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext}
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.dotcomrendering.InteractiveLibrarian

import scala.concurrent.Future

class InteractiveLibrarianController(
    wsClient: WSClient,
    akkaAsync: AkkaAsync,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def testing(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      InteractiveLibrarian.pressFromLive(wsClient, path).map { message =>
        Ok(message)
      }
    }
  }
}
