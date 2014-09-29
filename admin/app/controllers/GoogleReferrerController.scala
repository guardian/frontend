package controllers.admin

import common.{Logging, ExecutionContexts}
import controllers.AuthLogging
import model.NoCache
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc._
import tools.FormattedChart.{Cell, Row, Column}
import tools._
import jobs.OmnitureReports._

object GoogleReferrerController extends Controller with AuthLogging with Logging with ExecutionContexts {

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
  case class GoogleReferrerViews(
    date: DateTime,
    ratioOfGoogleReferrers: Double
  ) {
    lazy val jsonDate = s"Date(${date.getYear},${date.getMonthOfYear - 1},${date.getDayOfMonth})"
    lazy val simpleDate = date.toString("yyyy-MM-dd")
  }
  def renderGoogleReferrerDashboard() = AuthActions.AuthActionTest { request =>

    val reportTimestamp = jobs.OmnitureReportJob.getReport(googleReferrerViews).map {_.timeReceived.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")}

    val reportsObject = getOmnitureReports

    if (reportsObject.isEmpty) {
      NoCache(Ok("Reports not generated yet"))
    } else {

        val googleReferrerColumns = List(Column("time", "Time", "date"), Column("Google Referrer", "Page views with Google referrer", "number"))
        val googleReferrerRows = reportsObject.map { row =>
          val dateCell = Cell(row.jsonDate)
          val googleReferrerViews = Cell(row.ratioOfGoogleReferrers.toString)
          Row(List(dateCell, googleReferrerViews))
        }
        val googleReferrerChart = FormattedChart("Google-referred views over total views", googleReferrerColumns, googleReferrerRows, ChartFormat(Colour.`tone-features-3`))

        NoCache(Ok(views.html.googleReferrerViews("PROD", googleReferrerChart, "Proportion of page views with Google referrer", reportTimestamp)))
    }
  }

  private def getOmnitureReports: Seq[GoogleReferrerViews] = {
    val reportCounts: Seq[(String, Map[String, Seq[ReportResult]])] = for {
      reportName <- List(googleReferrerViews, networkTotalViews)
      report <- jobs.OmnitureReportJob.getReport(reportName)
    } yield {
      val results = (report.data \ "report" \ "data").validate[Seq[ReportResult]].getOrElse(Nil)
      (reportName, results.groupBy(_.name))
    }

    val resultsMap = reportCounts.toMap
    val reportsObject = for {
      name <- resultsMap.get(googleReferrerViews).map(_.keys).getOrElse(Nil)
      googleReferrerReport <- resultsMap.get(googleReferrerViews)
      networkTotalReport <- resultsMap.get(networkTotalViews)
      googleViews: ReportResult <- googleReferrerReport.get(name).flatMap(_.headOption)
      totalViews: ReportResult <- networkTotalReport.get(name).flatMap(_.headOption)
      googleCount <- googleViews.counts.headOption.map(_.toDouble)
      totalCount <- totalViews.counts.headOption.map(_.toDouble)
    } yield {
        val date = new DateTime(googleViews.year, googleViews.month, googleViews.day, 0, 0)
        GoogleReferrerViews(date, googleCount / totalCount * 100.0)
    }
    reportsObject.toSeq.sortBy(_.simpleDate)
  }
}
