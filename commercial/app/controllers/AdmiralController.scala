package commercial.controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import agents.AdmiralAgent
import common.{GuLogging, ImplicitControllerExecutionContext}
import model.Cached
import model.Cached.RevalidatableResult

import scala.concurrent.duration._

class AdmiralController(admiralAgent: AdmiralAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  def getBootstrapScript: Action[AnyContent] =
    Action { implicit request =>
      // Cache the result for 10 minutes
      // We only actually refresh the agent and fetch the bootstrap script once every 2 hours
      Cached(10.minutes)(RevalidatableResult.Ok(admiralAgent.getBootstrapScript))
    }
}
