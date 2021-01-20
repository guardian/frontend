package controllers

import common.GuLogging
import play.api.mvc.{Action, AnyContent, ControllerComponents, Results}
import conf.HealthCheckController
import frontpress.ToolPressQueueWorker
import org.joda.time.DateTime

import scala.concurrent.Future.successful

class HealthCheck(
    toolPressQueueWorker: ToolPressQueueWorker,
    val controllerComponents: ControllerComponents,
) extends HealthCheckController
    with Results
    with GuLogging {
  val ConsecutiveProcessingErrorsThreshold = 5
  override def healthCheck(): Action[AnyContent] =
    Action.async {
      val lastReceiptThresholdInMinutes = 1
      if (
        !toolPressQueueWorker.lastReceipt.exists(_.plusMinutes(lastReceiptThresholdInMinutes).isAfter(DateTime.now))
      ) {
        val msg =
          s"Have not been able to retrieve a message from the tool queue for at least ${lastReceiptThresholdInMinutes} minute(s)"
        log.error(msg)
        successful(Results.InternalServerError(msg))
      } else if (toolPressQueueWorker.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
        val msg = s"The last ${toolPressQueueWorker.consecutiveErrors} presses have resulted in internal errors"
        log.error(msg)
        successful(Results.InternalServerError(msg))
      } else {
        successful(Ok("OK"))
      }
    }
}
