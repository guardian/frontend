package controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class HealthCheck(val controllerComponents: ControllerComponents) extends BaseController {

  def healthCheck(): Action[AnyContent] =
    Action {
      Ok("OK")
    }

}
