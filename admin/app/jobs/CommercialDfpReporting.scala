package jobs

import java.time.{LocalDate, LocalDateTime}

import app.LifecycleComponent
import com.google.api.ads.admanager.axis.v202502.Column.{AD_SERVER_IMPRESSIONS, AD_SERVER_WITHOUT_CPD_AVERAGE_ECPM}
import com.google.api.ads.admanager.axis.v202502.DateRangeType.CUSTOM_DATE
import com.google.api.ads.admanager.axis.v202502.Dimension.{CUSTOM_CRITERIA, DATE}
import com.google.api.ads.admanager.axis.v202502._
import common.{PekkoAsync, Box, JobScheduler, GuLogging}
import dfp.DfpApi
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

object CommercialDfpReporting extends GuLogging {

  case class DfpReportRow(value: String) {
    val fields = value.split(",").toSeq
  }

  case class DfpReport(rows: Seq[DfpReportRow], lastUpdated: LocalDateTime)

  private val dfpReports = Box[Map[Long, Seq[DfpReportRow]]](Map.empty)
  private val dfpCustomReports = Box[Map[String, DfpReport]](Map.empty)

  val teamKPIReport = "All ab-test impressions and CPM"
  val prebidBidderPerformance = "Prebid Bidder Performance"

  // These IDs correspond to queries saved in DFP's web console.
  val reportMappings = Map(
    teamKPIReport -> 10060521970L, // This report is accessible by the DFP user: "NGW DFP Production"
  )

  private def prebidBidderPerformanceQry = {
    def toGoogleDate(date: LocalDate) = new Date(date.getYear, date.getMonthValue, date.getDayOfMonth)
    val weekAgo = LocalDate.now.minusWeeks(1)
    val qry = new ReportQuery()
    qry.setDateRangeType(CUSTOM_DATE)
    qry.setStartDate(toGoogleDate(weekAgo.minusDays(1)))
    qry.setEndDate(toGoogleDate(LocalDate.now))
    qry.setDimensions(Array(DATE, CUSTOM_CRITERIA))
    qry.setColumns(Array(AD_SERVER_IMPRESSIONS, AD_SERVER_WITHOUT_CPD_AVERAGE_ECPM))
    qry
  }

  def update(dfpApi: DfpApi)(implicit executionContext: ExecutionContext): Future[Unit] =
    Future {
      for {
        (_, reportId) <- reportMappings.toSeq
      } {
        val maybeReport: Option[Seq[DfpReportRow]] = dfpApi
          .getReportQuery(reportId)
          .map(reportId => {
            // exclude the CSV header
            dfpApi.runReportJob(reportId).tail.map(DfpReportRow)
          })

        maybeReport.foreach { report: Seq[DfpReportRow] =>
          dfpReports.send(currentMap => {
            currentMap + (reportId -> report)
          })
        }
      }

      dfpCustomReports.send { prev =>
        val curr = prev + {
          prebidBidderPerformance ->
            DfpReport(
              rows = dfpApi.runReportJob(prebidBidderPerformanceQry).filter(_.contains("hb_bidder=")).map(DfpReportRow),
              lastUpdated = LocalDateTime.now,
            )
        }
        curr foreach { case (key, report) =>
          log.info(s"Updated report '$key' with ${report.rows.size} rows")
        }
        curr
      }
    }

  def getReport(reportId: Long): Option[Seq[DfpReportRow]] = dfpReports.get().get(reportId)
  def getCustomReport(reportName: String): Option[DfpReport] = dfpCustomReports.get().get(reportName)
}

class CommercialDfpReportingLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    dfpApi: DfpApi,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("CommercialDfpReportingJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("CommercialDfpReportingJob")

    CommercialDfpReporting.update(dfpApi)(ec)

    // 30 minutes between each log write.
    jobs.scheduleEveryNMinutes("CommercialDfpReportingJob", 30) {
      log.logger.info(s"Fetching commercial dfp report from dfp api")
      CommercialDfpReporting.update(dfpApi)(ec)
    }
  }

}
