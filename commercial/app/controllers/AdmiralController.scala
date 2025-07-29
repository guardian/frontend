package commercial.controllers

import agents.AdmiralAgent
import common.{GuLogging, ImplicitControllerExecutionContext}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class AdmiralController(admiralAgent: AdmiralAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  def getBootstrapScript: Action[AnyContent] =
    Action {
      Ok(admiralAgent.getBootstrapScript)
    }
}
