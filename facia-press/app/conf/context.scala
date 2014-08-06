package conf

import frontpress.ToolPressQueueWorker
import org.joda.time.DateTime
import _root_.play.api.mvc.{Results, Action}

import scala.concurrent.Future

object HealthCheck extends HealthcheckController with Results {

  import Future.successful

  override lazy val testPort = 9014

  val ConsecutiveProcessingErrorsThreshold = 5

  override def healthcheck() = Action.async{
    if (!ToolPressQueueWorker.lastReceipt.exists(_.plusMinutes(1).isAfter(DateTime.now))) {
      successful(Results.InternalServerError("Have not been able to retrieve a message from the tool queue for at least a minute"))
    } else if (ToolPressQueueWorker.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
      successful(Results.InternalServerError(s"The last ${ToolPressQueueWorker.consecutiveErrors} presses have resulted in internal errors"))
    } else {
      successful(Ok("OK"))
    }
  }
}