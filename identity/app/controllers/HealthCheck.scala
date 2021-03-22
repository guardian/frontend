package controllers

import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

class HealthCheck(cc: ControllerComponents) extends AbstractController(cc) {

  def healthCheck: Action[AnyContent] =
    Action {
      Ok("200 OK")
    }
}
