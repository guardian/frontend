package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.{DateTimeZone, DateTime}
import services.Omniture._
import OmnitureMethods._
import scala.concurrent.duration._
import scala.concurrent.Future

object OmnitureVariables {
  // Metrics
  val pageViews = "pageViews"
  val visits = "visits"
  val navigationalInteractionEvent = "event37"
  val socialInteractionEvent = "event16"

  // Segments
  val segmentGalleryVisits = Some("53fddc4fe4b08891cec2831a")
  val segmentGalleryHits = Some("5400793ee4b0230c643d3a96")
  val segmentGalleryLightboxHits = Some("5400a89fe4b0230c643d3b46")
  val segmentGoogleReferrerVisits = Some("54242f34e4b0e1cfa16a4530")
  val segmentLiveBlogVisits = Some("543bf12de4b0e1cfa16a7376")
}

object OmnitureReports {
  val galleryVisits = "gallery-visits"
  val galleryPageViews = "gallery-page-views"
  val galleryLightBox = "gallery-launch-lightbox"
  val gallerySocialShare = "gallery-social-share"
  val googleReferrerVisits = "google-referrer-visits"
  val networkTotalVisits = "network-total-visits"
  val liveBlogVisitsAndSocial = "liveblog-visits-and-social"
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

    // Stagger each report request, otherwise omniture request nonce values will be identical.
    akka.pattern.after(1.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateFrom.toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(pageViews)),
        segment_id = segmentGalleryHits
      ), QUEUE_OVERTIME, galleryPageViews)
    })

    akka.pattern.after(5.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateFrom.toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(visits)),
        segment_id = segmentGalleryVisits
      ), QUEUE_OVERTIME, galleryVisits)
    })

    akka.pattern.after(10.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateFrom.toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(navigationalInteractionEvent)),
        segment_id = segmentGalleryLightboxHits
      ), QUEUE_OVERTIME, galleryLightBox)
    })

    akka.pattern.after(15.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateFrom.toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(socialInteractionEvent)),
        segment_id = segmentGalleryVisits
      ), QUEUE_OVERTIME, gallerySocialShare)
    })

    akka.pattern.after(20.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateTo.minusWeeks(4).toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(visits)),
        segment_id = segmentGoogleReferrerVisits,
        reportSuiteID = OmnitureReportDescription.reportSuiteNetwork
      ), QUEUE_OVERTIME, googleReferrerVisits)
    })

    akka.pattern.after(25.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateTo.minusWeeks(4).toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(visits)),
        reportSuiteID = OmnitureReportDescription.reportSuiteNetwork
      ), QUEUE_OVERTIME, networkTotalVisits)
    })

    akka.pattern.after(30.seconds, actorSystem.scheduler) (Future {
      generateReport(OmnitureReportDescription(
        dateGranularity = Some("day"),
        dateTo = dateTo.toString("yyyy-MM-dd"),
        dateFrom = dateFrom.toString("yyyy-MM-dd"),
        metrics = List(OmnitureMetric(visits), OmnitureMetric(socialInteractionEvent)),
        segment_id = segmentLiveBlogVisits
      ), QUEUE_OVERTIME, liveBlogVisitsAndSocial)
    })
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