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
      // This view is displayed on the admin tool
      Ok(views.html.pressInteractive())
    }

  def press(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      // This function combines both pressing and cleaning
      // Initially intended for use by the frontend admin tool
      val result = for {
        _ <- InteractiveLibrarian.pressLiveContents(wsClient, path)
        (ok, errorMsg) = InteractiveLibrarian.readCleanWrite(path)
      } yield {
        if (ok) {
          println("press success")
          "Pressed successfully!"
        } else {
          errorMsg
        }
      }

      result.map { res =>
        Ok(res)
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
