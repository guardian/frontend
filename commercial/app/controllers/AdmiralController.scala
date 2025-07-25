package commercial.controllers

import commercial.AdmiralAgent
import common.{GuLogging, ImplicitControllerExecutionContext}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class AdmiralController(val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  def getBootstrapScript(): Action[AnyContent] =
    Action {
      Ok(AdmiralAgent.getBootstrapScript)
    }
}
