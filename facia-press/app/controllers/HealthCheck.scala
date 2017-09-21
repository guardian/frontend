package controllers

import play.api.mvc.{Action, AnyContent, ControllerComponents, Results}
import conf.HealthCheckController
import frontpress.ToolPressQueueWorker
import org.joda.time.DateTime

import scala.concurrent.Future.successful

class HealthCheck(
  toolPressQueueWorker: ToolPressQueueWorker,
  val controllerComponents: ControllerComponents
)
  extends HealthCheckController with Results {
  val ConsecutiveProcessingErrorsThreshold = 5
  override def healthCheck(): Action[AnyContent] = Action.async{
    if (!toolPressQueueWorker.lastReceipt.exists(_.plusMinutes(1).isAfter(DateTime.now))) {
      successful(Results.InternalServerError("Have not been able to retrieve a message from the tool queue for at least a minute"))
    } else if (toolPressQueueWorker.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
      successful(Results.InternalServerError(s"The last ${toolPressQueueWorker.consecutiveErrors} presses have resulted in internal errors"))
    } else {
      successful(Ok("OK"))
    }
  }
}
