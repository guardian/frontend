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

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.pressInteractive(urlMsgs, fileMsgs))
    }

  def press(): Action[AnyContent] =
    Action { implicit request =>
      val body = request.body
      val result = body.asFormUrlEncoded
        .map { form =>
          form("interactiveUrl").map { interactiveUrl =>
            interactiveUrl.trim match {
              case url if url.nonEmpty =>
                // TODO: make next line better
                val path = url.replace("https://www.theguardian.com", "")
                val res = InteractiveLibrarian.pressLiveContents(wsClient, path).map { message =>
                  println(s"message ${message}")
                  message.contains("Operation successful") match {
                    case true =>
                      val res = InteractiveLibrarian.readCleanWrite(path)
                      println(s"clean message ${res}")
                    case false => "Failed to press"
                  }
                }

              case _ => "URL not specified"
            }
          }
        }
        .map(_.toList)
        .getOrElse(List.empty)
      println(s"results ${result}")
      Ok(views.html.pressInteractive())
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
