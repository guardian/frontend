package controllers

import _root_.play.api.mvc.{Action, Results}
import conf.HealthCheckController
import frontpress.ToolPressQueueWorker
import org.joda.time.DateTime

import scala.concurrent.Future.successful

object HealthCheck extends HealthCheckController with Results {
  val ConsecutiveProcessingErrorsThreshold = 5
  override def healthCheck() = Action.async{
    if (!ToolPressQueueWorker.lastReceipt.exists(_.plusMinutes(1).isAfter(DateTime.now))) {
      successful(Results.InternalServerError("Have not been able to retrieve a message from the tool queue for at least a minute"))
    } else if (ToolPressQueueWorker.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
      successful(Results.InternalServerError(s"The last ${ToolPressQueueWorker.consecutiveErrors} presses have resulted in internal errors"))
    } else {
      successful(Ok("OK"))
    }
  }
}
