package controllers

import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import rendering.TestComponent
import rendering.core.Renderer

import scala.concurrent.ExecutionContext

class DevComponentController(
  renderer: Renderer,
  val controllerComponents: ControllerComponents
)(implicit ac: ApplicationContext, ec: ExecutionContext)
  extends BaseController {

  def renderComponent(): Action[AnyContent] = Action.async { implicit request =>
    renderer.render(TestComponent).map(Ok(_).withHeaders("Content-Type" -> "text/html"))
  }

}
