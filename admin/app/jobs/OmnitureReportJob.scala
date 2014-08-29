package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.{DateTimeZone, DateTime}
import services.Omniture._
import OmnitureMethods._

object OmnitureVariables {

  // Metrics
  val pageViews = "pageViews"
  val visits = "visits"
  val navigationalInteractionEvent = "event37"

  // Elements
  val videoViews = "event17"
  val contentType = "prop9"
  val navigationalInteraction = "evar37"
}

object OmnitureReports {
  val galleryVisits = "gallery-visits"
  val galleryPageViews = "gallery-page-views"
  val galleryLightBox = "gallery-launch-lightbox"
}

object OmnitureReportJob extends ExecutionContexts with Logging {

  import OmnitureVariables._
  import OmnitureReports._

  private val omnitureReportAgent = AkkaAgent[Map[String, Either[Throwable, OmnitureReportData]]](Map.empty)

  def getReport(reportName: String): Option[OmnitureReportData] = omnitureReportAgent().get(reportName).flatMap {_.right.toOption}
  def getReportOrResult(reportName: String): Either[Throwable, OmnitureReportData] = omnitureReportAgent().getOrElse(reportName, Left(OmnitureException("Report not found")))

  def run() {

    // gallery page views and gallery visits in the last two weeks.
    // One report needed for each trended metric, unfortunately.
    val dateTo = new DateTime(DateTimeZone.UTC)
    val dateFrom = dateTo.minusWeeks(2)

    generateReport(OmnitureReportDescription(
      dateGranularity = Some("day"),
      dateTo = dateTo.toString("yyyy-MM-dd"),
      dateFrom = dateFrom.toString("yyyy-MM-dd"),
      metrics = List(OmnitureMetric(pageViews)),
      segment_id = Some("Gallery Visit")
    ), QUEUE_OVERTIME, galleryPageViews)

    generateReport(OmnitureReportDescription(
      dateGranularity = Some("day"),
      dateTo = dateTo.toString("yyyy-MM-dd"),
      dateFrom = dateFrom.toString("yyyy-MM-dd"),
      metrics = List(OmnitureMetric(visits)),
      segment_id = Some("Gallery Visit")
    ), QUEUE_OVERTIME, galleryVisits)

    generateReport(OmnitureReportDescription(
      dateGranularity = Some("day"),
      dateTo = dateTo.toString("yyyy-MM-dd"),
      dateFrom = dateFrom.toString("yyyy-MM-dd"),
      metrics = List(OmnitureMetric(navigationalInteractionEvent)),
      segment_id = Some("Gallery Lightbox")
    ), QUEUE_OVERTIME, galleryLightBox)
  }

  private def generateReport(report: OmnitureReportDescription, method: String, reportName: String) {
    Omniture.generateReport(report, method).map { report =>
      log.info(s"Omniture report success: $reportName")
      updateAgent(reportName, Right(report))
    }.recover {
      case error: Throwable => {
        log.warn(s"report $reportName failed: ${error.getMessage}")
        updateAgent(reportName, Left(error))
      }
    }
  }

  private def updateAgent(reportName: String, newValue: Either[Throwable, OmnitureReportData]) {
    omnitureReportAgent.send{ old =>
      old + (reportName -> newValue)
    }
  }
}