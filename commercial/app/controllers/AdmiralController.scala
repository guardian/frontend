package commercial.controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import agents.AdmiralAgent
import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{Cached, NoCache}
import model.Cached.RevalidatableResult

import scala.concurrent.duration._

class AdmiralController(admiralAgent: AdmiralAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  def getBootstrapScript: Action[AnyContent] =
    Action { implicit request =>
      admiralAgent.getBootstrapScript match {
        case Some(script) =>
          Cached(1.minute)(
            RevalidatableResult(Ok(script).as("text/javascript; charset=utf-8"), script),
          )
        case None => NotFound
      }
    }
}
