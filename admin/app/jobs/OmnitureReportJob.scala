package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.{DateTimeZone, DateTime}
import play.api.libs.json.JsValue
import services.Omniture._

object OmnitureVariables {

  // Metrics
  val pageViews = "pageViews"
  val visits = "visits"

  // Elements
  val videoViews = "event17"
  val contentType = "prop9"
}

object OmnitureReportJob extends ExecutionContexts with Logging {

  import OmnitureVariables._

  private val omnitureReportAgent = AkkaAgent[Map[String, OmnitureReportData]](Map.empty)

  def getReport(reportName: String): Option[OmnitureReportData] = omnitureReportAgent().get(reportName)

  def run() {

    // gallery page views and gallery visits in the last two weeks.
    // One report needed for each trended metric, unfortunately.
    val dateTo = new DateTime(DateTimeZone.UTC)
    val dateFrom = dateTo.minusWeeks(2)

    generateTrendedReport(OmnitureReportDescription(
      dateGranularity = Some("day"),
      dateTo = dateTo.toString("yyyy-MM-dd"),
      dateFrom = dateFrom.toString("yyyy-MM-dd"),
      metrics = List(OmnitureMetric(pageViews)),
      elements = List(OmnitureElement(contentType, selected = List("Gallery")))
    ), "GalleryPageViews")

    generateTrendedReport(OmnitureReportDescription(
      dateGranularity = Some("day"),
      dateTo = dateTo.toString("yyyy-MM-dd"),
      dateFrom = dateFrom.toString("yyyy-MM-dd"),
      metrics = List(OmnitureMetric(visits)),
      elements = List(OmnitureElement(contentType, selected = List("Gallery")))
    ), "GalleryVisits")
  }

  private def generateTrendedReport(report: OmnitureReportDescription, reportName: String) {
    Omniture.generateReport(report, OmnitureMethods.QUEUE_TRENDED).map { report =>
      log.info(s"Updating report: $reportName")
      omnitureReportAgent.send{ old =>
        old + (reportName -> report)
      }
    }.recover {
      case responseError: OmnitureException => log.warn(s"Failed:\n ${responseError.message}")
      case error: Throwable => log.warn(error.getMessage)
    }
  }
}