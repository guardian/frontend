package jobs

import java.time.LocalDate

import app.LifecycleComponent
import com.google.api.ads.dfp.axis.v201705._
import com.gu.Box
import common.{AkkaAsync, JobScheduler, Logging}
import dfp.DfpApi
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

object CommercialDfpReporting {

  case class DfpReportRow(value: String) {
    val fields = value.split(",").toSeq
  }

  private val dfpReports = Box[Map[Long, Seq[DfpReportRow]]](Map.empty)
  private val dfpCustomReports = Box[Map[String, Seq[DfpReportRow]]](Map.empty)

  val teamKPIReport = "All ab-test impressions and CPM"
  val prebidBidderPerformance = "Prebid Bidder Performance"

  // These IDs correspond to queries saved in DFP's web console.
  val reportMappings = Map(
    teamKPIReport -> 10060521970L // This report is accessible by the DFP user: "NGW DFP Production"
  )

  private val prebidBidderPerformanceQry = {
    def toGoogleDate(date: LocalDate) = new Date(date.getYear, date.getMonthValue, date.getDayOfMonth)
    val prebidBegan = LocalDate.of(2018, 1, 22)
    val qry = new ReportQuery()
    qry.setDateRangeType(DateRangeType.CUSTOM_DATE)
    qry.setStartDate(toGoogleDate(prebidBegan.minusDays(1)))
    qry.setEndDate(toGoogleDate(LocalDate.now))
    qry.setDimensions(Array(Dimension.DATE, Dimension.CUSTOM_CRITERIA))
    qry.setColumns(Array(Column.AD_SERVER_IMPRESSIONS, Column.AD_SERVER_WITHOUT_CPD_AVERAGE_ECPM))
    qry
  }

  def update(dfpApi: DfpApi)(implicit executionContext: ExecutionContext): Future[Unit] = Future {
    for {
      (_, reportId) <- reportMappings.toSeq
    } {
      val maybeReport: Option[Seq[DfpReportRow]] = dfpApi.getReportQuery(reportId)
        .map(reportId => {
          // exclude the CSV header
          dfpApi.runReportJob(reportId).tail.map(DfpReportRow)
        })

      maybeReport.foreach { report: Seq[DfpReportRow] =>
        dfpReports.send( currentMap => {
          currentMap + (reportId -> report)
        })
      }
    }

    dfpCustomReports.send(curr =>
      curr + {
        prebidBidderPerformance ->
          dfpApi.runReportJob(prebidBidderPerformanceQry).tail.filter(_.contains("hb_bidder=")).map(DfpReportRow)
    })
  }

  def getReport(reportId: Long): Option[Seq[DfpReportRow]] = dfpReports.get().get(reportId)
  def getCustomReport(reportName: String): Option[Seq[DfpReportRow]] = dfpCustomReports.get().get(reportName)
}

class CommercialDfpReportingLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  dfpApi: DfpApi)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    jobs.deschedule("CommercialDfpReportingJob")
  }}

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
