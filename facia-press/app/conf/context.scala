package conf

import com.gu.management.{HealthcheckManagementPage, HttpRequest, ErrorResponse, ManifestPage, StatusPage, PropertiesPage}
import common.Metrics

import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage
import frontpress.ToolPressQueueWorker
import org.joda.time.DateTime
import _root_.play.api.mvc.{Results, Action, Result}

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

object Management extends GuManagement {
  val applicationName = "frontend-facia-press"

  val metrics = Metrics.faciaPress

  val ConsecutiveProcessingErrorsThreshold = 5

  val healthCheck = new HealthcheckManagementPage {
    override def get(req: HttpRequest) = {
      if (!ToolPressQueueWorker.lastReceipt.exists(_.plusMinutes(1).isAfter(DateTime.now))) {
        ErrorResponse(500, "Have not been able to retrieve a message from the tool queue for at least a minute")

      } else if (ToolPressQueueWorker.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
        ErrorResponse(500, s"The last ${ToolPressQueueWorker.consecutiveErrors} presses have resulted in internal errors")
      } else {
        super.get(req)
      }
    }
  }

  lazy val pages = List(
    new ManifestPage,
    StatusPage(applicationName, metrics),
    healthCheck,
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
