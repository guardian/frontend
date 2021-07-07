package controllers.admin

import common.{AkkaAsync, GuLogging, ImplicitControllerExecutionContext}
import model.ApplicationContext
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

  def liveContentsPress(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      InteractiveLibrarian.pressLiveContents(wsClient, path).map { message =>
        Ok(message)
      }
    }
  }

  def readCleanWrite(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val status = InteractiveLibrarian.readCleanWrite(path)
      Future.successful(Ok(status.toString()))
    }
  }
}
