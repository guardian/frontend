package controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import scala.concurrent.Future

class LiveHarnessController(val controllerComponents: ControllerComponents) extends BaseController {
  def renderLiveHarness(path: String): Action[AnyContent] = Action.async { implicit request =>
    Future.successful(Ok("Hello, world!"))
  }
}
