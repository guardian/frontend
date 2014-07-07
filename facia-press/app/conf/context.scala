package conf

import common.Metrics
import com.gu.management._
import com.gu.management.play.{Management => GuManagement}
import com.gu.management.logback.LogbackLevelPage
import frontpress.ToolPressQueue
import org.joda.time.DateTime

object Management extends GuManagement {
  val applicationName = "frontend-facia-press"

  val metrics = Metrics.faciaPress

  val ConsecutiveProcessingErrorsThreshold = 5

  val healthCheck = new HealthcheckManagementPage {
    override def get(req: HttpRequest) = {
      if (!ToolPressQueue.lastReceipt.exists(_.plusMinutes(1).isAfter(DateTime.now))) {
        ErrorResponse(500, "Have not been able to retrieve a message from the tool queue for at least a minute")

      } else if (ToolPressQueue.consecutiveErrors >= ConsecutiveProcessingErrorsThreshold) {
        ErrorResponse(500, s"The last ${ToolPressQueue.consecutiveErrors} presses have resulted in internal errors")
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
