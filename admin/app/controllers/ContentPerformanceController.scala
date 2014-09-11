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

object ContentPerformanceController extends Controller with AuthLogging with Logging with ExecutionContexts {

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
  case class GalleryPerformance(
    date: DateTime,
    pageViewsPerVisit: Double,
    lightboxLaunchesPerVisit: Double
  ) {
    lazy val jsonDate = s"Date(${date.getYear},${date.getMonthOfYear - 1},${date.getDayOfMonth})"
    lazy val simpleDate = date.toString("yyyy-MM-dd")
  }

  def renderGalleryDashboard() = AuthActions.AuthActionTest { request =>

    val reportTimestamp = jobs.OmnitureReportJob.getReport(galleryVisits).map {_.timeReceived.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")}

    val reportCounts: Seq[(String, Map[String, Seq[ReportResult]])] = for {
      reportName <- List(galleryPageViews, galleryVisits, galleryLightBox)
      report <- jobs.OmnitureReportJob.getReport(reportName)
    } yield {
      val results = (report.data \ "report" \ "data").validate[Seq[ReportResult]].getOrElse(Nil)
      (reportName, results.groupBy(_.name))
    }

    val resultsMap = reportCounts.toMap
    val reportsObject = for {
      name <- resultsMap.get(galleryVisits).map(_.keys).getOrElse(Nil)
      galleryViewsReport <- resultsMap.get(galleryPageViews)
      galleryVisitsReport <- resultsMap.get(galleryVisits)
      lightboxLaunchesReport <- resultsMap.get(galleryLightBox)
      galleryViews: ReportResult <- galleryViewsReport.get(name).flatMap(_.headOption)
      galleryVisits: ReportResult <- galleryVisitsReport.get(name).flatMap(_.headOption)
      lightboxLaunches: ReportResult <- lightboxLaunchesReport.get(name).flatMap(_.headOption)
      views <- galleryViews.counts.headOption.map(_.toDouble)
      visits <- galleryVisits.counts.headOption.map(_.toDouble)
      lightboxes <- lightboxLaunches.counts.headOption.map(_.toDouble)
    } yield {
      val date = new DateTime(galleryViews.year, galleryViews.month, galleryViews.day, 0, 0)
      GalleryPerformance(date, views / visits, lightboxes / views)
    }

    if (reportsObject.isEmpty) {
      NoCache(Ok("Reports not generated yet"))
    } else {

      val lightboxColumns = List(Column("time", "Time", "date"), Column("lightboxes", "Lightbox views per gallery", "number"))
      val lightboxRows = reportsObject.toSeq.sortBy(_.simpleDate).map { row =>
        val dateCell = Cell(row.jsonDate)
        val lightboxCount = Cell(row.lightboxLaunchesPerVisit.toString)
        Row(List(dateCell, lightboxCount))
      }
      val lightboxChart = FormattedChart("Lightbox Views per Gallery Page View", lightboxColumns, lightboxRows, ChartFormat(Colour.`tone-features-3`))

      val galleryColumns = List(Column("time", "Time", "date"), Column("pvv", "Gallery views per visit", "number"))
      val galleryRows = reportsObject.toSeq.sortBy(_.simpleDate).map { row =>
        val dateCell = Cell(row.jsonDate)
        val pageViews = Cell(row.pageViewsPerVisit.toString)
        Row(List(dateCell, pageViews))
      }
      val galleryChart = FormattedChart("Gallery Page Views per Gallery Visit", galleryColumns, galleryRows, ChartFormat(Colour.`tone-comment-2`))

      NoCache(Ok(views.html.contentGallery("PROD", galleryChart, lightboxChart, "Gallery Performance", reportTimestamp)))
    }
  }
}
