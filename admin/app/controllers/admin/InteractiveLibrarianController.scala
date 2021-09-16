package controllers.admin

import common.{AkkaAsync, GuLogging, ImplicitControllerExecutionContext}
import conf.switches.Switches.InteractiveLibrarianAdminRoutes
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

  def pressForm(): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.pressInteractive())
    }

  /**
    * This function combines both pressing and cleaning
    *
    * @param path
    * @return success or failure, including message
    */
  def press(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      // This function combines both pressing and cleaning
      for {
        _ <- InteractiveLibrarian.pressLiveContents(wsClient, path)
      } yield {
        val (ok, errorMsg) = InteractiveLibrarian.readCleanWrite(path)
        if (ok) {
          Ok("Pressed successfully!")
        } else {
          InternalServerError(errorMsg)
        }
      }
    }

  def liveContentsPress(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      if (InteractiveLibrarianAdminRoutes.isSwitchedOn) {
        InteractiveLibrarian.pressLiveContents(wsClient, path).map { message =>
          Ok(message)
        }
      } else {
        Future.successful(NotFound)
      }
    }
  }

  def readCleanWrite(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      if (InteractiveLibrarianAdminRoutes.isSwitchedOn) {
        val status = InteractiveLibrarian.readCleanWrite(path)
        Future.successful(Ok(status.toString()))
      } else {
        Future.successful(NotFound)
      }
    }
  }
}
