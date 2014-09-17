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
import scala.math.pow

object ContentPerformanceController extends Controller with AuthLogging with Logging with ExecutionContexts {

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
  case class GalleryPerformance(
    date: DateTime,
    views: Double,
    pageViewsPerVisit: Double,
    lightboxLaunchesPerVisit: Double,
    percentageOfViewsShared: Double
  ) {
    lazy val jsonDate = s"Date(${date.getYear},${date.getMonthOfYear - 1},${date.getDayOfMonth})"
    lazy val simpleDate = date.toString("yyyy-MM-dd")
  }

  case class SentryErrorData(
    date: DateTime,
    errorCount: Long
  ) {
    lazy val jsonDate = s"Date(${date.getYear},${date.getMonthOfYear - 1},${date.getDayOfMonth})"
  }

  def renderGalleryDashboard() = AuthActions.AuthActionTest { request =>

    val reportTimestamp = jobs.OmnitureReportJob.getReport(galleryVisits).map {_.timeReceived.toString("yyyy-MM-dd'T'HH:mm:ss'Z'")}

    val reportsObject = getOmnitureReports

    val sentryData = getSentryData

    (reportsObject.isEmpty, sentryData.isEmpty) match {
      case (true, true) => NoCache(Ok("Reports not generated yet"))
      case (false, true) => NoCache(Ok("Sentry reports not generated"))
      case (true, false) => NoCache(Ok("Omniture report not generated yet"))
      case _ =>
        val sentryErrorColumns = List(Column("time", "Time", "date"), Column("Gallery Errors", "Gallery Js errors per gallery visits(%) ", "number"))
        val sentryRows = sentryData.zip(reportsObject).map {
          case (sentry, omniture) =>
              val dateCell = Cell(sentry.jsonDate)
              val roundedCount = ((sentry.errorCount / omniture.views) * 100).rounded(3).toString
              val count = Cell(roundedCount)
              Row(List(dateCell, count))
        }
        val sentryChart = FormattedChart("Sentry errors per day as a % of number of gallery visits", sentryErrorColumns, sentryRows, ChartFormat(Colour.`tone-live-1`))

        val lightboxColumns = List(Column("time", "Time", "date"), Column("lightboxes", "Lightbox views per gallery", "number"))
        val lightboxRows = reportsObject.map { row =>
          val dateCell = Cell(row.jsonDate)
          val roundedCount = row.lightboxLaunchesPerVisit.rounded(3).toString
          val lightboxCount = Cell(roundedCount)
          Row(List(dateCell, lightboxCount))
        }
        val lightboxChart = FormattedChart("Lightbox Views per Gallery Page View", lightboxColumns, lightboxRows, ChartFormat(Colour.`tone-features-3`))

        val galleryColumns = List(Column("time", "Time", "date"), Column("pvv", "Gallery views per visit", "number"))
        val galleryRows = reportsObject.map { row =>
          val dateCell = Cell(row.jsonDate)
          val roundedPageViews = row.pageViewsPerVisit.rounded(3).toString
          val pageViews = Cell(roundedPageViews)
          Row(List(dateCell, pageViews))
        }
        val galleryChart = FormattedChart("Gallery Page Views per Gallery Visit", galleryColumns, galleryRows, ChartFormat(Colour.`tone-comment-2`))


        val shareColumns = List(Column("time", "Time", "date"), Column("shares", "Social share per gallery(%)", "number"))
        val shareRows = reportsObject.map {
          row =>
            val dateCell = Cell(row.jsonDate)
            val roundedShares = row.percentageOfViewsShared.rounded(3).toString
            val galleryShares = Cell(roundedShares)
            Row(List(dateCell, galleryShares))
        }
        val shareChart = FormattedChart("Social shares  per Gallery Page View(%)", shareColumns, shareRows, ChartFormat(Colour.`tone-live-2`))

        NoCache(Ok(views.html.contentGallery("PROD", galleryChart, lightboxChart, sentryChart, shareChart, "Gallery Performance", reportTimestamp)))
    }
  }

  private def getSentryData: Seq[SentryErrorData] = {
    val sentryData = jobs.SentryReportJob.getReport("Gallery")

    val sentryObject = for {
      (date, count) <- sentryData
    } yield {
      new SentryErrorData(date, count)
    }
    sentryObject.toSeq
  }

  private def getOmnitureReports: Seq[GalleryPerformance] = {
    val reportCounts: Seq[(String, Map[String, Seq[ReportResult]])] = for {
      reportName <- List(galleryPageViews, galleryVisits, galleryLightBox, gallerySocialShare)
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
      gallerySocialSharesReport <- resultsMap.get(gallerySocialShare)
      galleryViews: ReportResult <- galleryViewsReport.get(name).flatMap(_.headOption)
      galleryVisits: ReportResult <- galleryVisitsReport.get(name).flatMap(_.headOption)
      lightboxLaunches: ReportResult <- lightboxLaunchesReport.get(name).flatMap(_.headOption)
      gallerySocialShares: ReportResult <- gallerySocialSharesReport.get(name).flatMap(_.headOption)
      views <- galleryViews.counts.headOption.map(_.toDouble)
      visits <- galleryVisits.counts.headOption.map(_.toDouble)
      lightboxes <- lightboxLaunches.counts.headOption.map(_.toDouble)
      shares <- gallerySocialShares.counts.headOption.map(_.toDouble)
    } yield {
        val date = new DateTime(galleryViews.year, galleryViews.month, galleryViews.day, 0, 0)
        GalleryPerformance(date, views, (views / visits), lightboxes / views, (shares / views) * 100)
    }
    reportsObject.toSeq.sortBy(_.simpleDate)
  }
}
