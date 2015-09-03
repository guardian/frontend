package controllers.admin

import common.{Logging, ExecutionContexts}
import controllers.AuthLogging
import model.NoCache
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.json._
import play.api.mvc._
import tools.FormattedChart.{Cell, Row, Column}
import tools._
import jobs.OmnitureReports._
import scala.math.pow

object ContentPerformanceController extends Controller with AuthLogging with Logging with ExecutionContexts {

  val missingVideoEncodingDateTimeFormat = DateTimeFormat.forPattern("hh:mm::ss")

  implicit class ExtendedDouble(n: Double) {
    def rounded(x: Int) = {
      val w = pow(10, x)
      (n * w).toLong.toDouble / w
    }
  }
  case class ReportResult(
    name: String,
    year: Int,
    month: Int,
    day: Int,
    counts: Seq[String]
  )
  object ReportResult {
    implicit val reads = Json.reads[ReportResult]
  }
  trait TimestampDataPoint {
    val date: DateTime
    lazy val jsonDate = s"Date(${date.getYear},${date.getMonthOfYear - 1},${date.getDayOfMonth})"
    lazy val simpleDate = date.toString("yyyy-MM-dd")
  }
  case class GalleryPerformance(
    override val date: DateTime,
    views: Double,
    pageViewsPerVisit: Double,
    lightboxLaunchesPerVisit: Double,
    percentageOfViewsShared: Double
  ) extends TimestampDataPoint

  case class LiveBlogPerformance(
    override val date: DateTime,
    socialInteractionsPerVisit: Double
  ) extends TimestampDataPoint

  case class SentryErrorData(
    override val date: DateTime,
    errorCount: Long
  ) extends TimestampDataPoint


  private def getLiveBlogOmnitureReports(): Seq[LiveBlogPerformance] = {
    val reportCounts: Seq[(String, Map[String, Seq[ReportResult]])] = for {
      reportName <- List(liveBlogVisitsAndSocial)
      report <- jobs.OmnitureReportJob.getReport(reportName)
    } yield {
      val results = (report.data \ "report" \ "data").validate[Seq[ReportResult]].getOrElse(Nil)
      (reportName, results.groupBy(_.name))
    }

    val resultsMap = reportCounts.toMap
    val reportsObject = for {
      liveBlogSocialReport <- List(resultsMap.get(liveBlogVisitsAndSocial)).flatten
      name <- liveBlogSocialReport.keys
      reportResult: ReportResult <- liveBlogSocialReport.get(name).flatMap(_.headOption)
      visits <- reportResult.counts.lift(0).map(_.toDouble) // The first count is the visits
      shares <- reportResult.counts.lift(1).map(_.toDouble) // The second count is the shares
    } yield {
        val date = new DateTime(reportResult.year, reportResult.month, reportResult.day, 0, 0)
        LiveBlogPerformance(date, (shares / visits) * 100)
    }
    reportsObject.toSeq.sortBy(_.simpleDate)
  }

  def renderLiveBlogDashboard() = AuthActions.AuthActionTest { request =>

    val reportTimestamp = jobs.OmnitureReportJob.getReport(liveBlogVisitsAndSocial).map {_.timeReceived.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")}

    val reportsObject = getLiveBlogOmnitureReports()

    if (reportsObject.isEmpty) {
      NoCache(Ok("Omniture report not generated yet"))
    } else {
        val socialSharesColumns = List(Column("time", "Time", "date"), Column("Shares", "Social Share rate", "number"))
        val socialSharesRows = reportsObject.map { row =>
          val dateCell = Cell(row.jsonDate)
          val roundedCount = row.socialInteractionsPerVisit.rounded(3).toString
          val socialCount = Cell(roundedCount)
          Row(List(dateCell, socialCount))
        }
        val socialInteractionsChart = FormattedChart("Social shares per Live Blog Visit", socialSharesColumns, socialSharesRows, ChartFormat(Colour.`tone-features-3`))

        NoCache(Ok(views.html.contentLiveBlog("PROD", socialInteractionsChart, "Live Blog Performance", reportTimestamp)))
    }
  }

  def renderVideoEncodingsDashboard() = AuthActions.AuthActionTest { request =>

    val videoEncodingsReport = jobs.VideoEncodingsJob.getReport("missing-encodings")


    videoEncodingsReport match {
      case Some(Nil) => NoCache(Ok(s"There are no reported encodings missing as of: ${missingVideoEncodingDateTimeFormat.print(DateTime.now())}" ))
      case Some(videoEncodings)=> NoCache(Ok( views.html.missingVideoEncodings( "PROD", videoEncodings) ) )
      case None => NoCache(Ok("Missing video encoding: report has not yet generated"))
    }
 }
}


