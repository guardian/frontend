package controllers

import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import rendering.core.{JavascriptProps, Renderer}

import scala.concurrent.ExecutionContext

class DevComponentController(
  renderer: Renderer,
  val controllerComponents: ControllerComponents
)(implicit ac: ApplicationContext, ec: ExecutionContext)
  extends BaseController {

  def props(): Action[AnyContent] = Action { _ =>
    Ok(JavascriptProps.default.asJsValue)
  }

}
