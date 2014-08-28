package controllers.admin

import common.{Logging, ExecutionContexts}
import controllers.AuthLogging
import model.NoCache
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc._
import tools._

object ContentPerformanceController extends Controller with AuthLogging with Logging with ExecutionContexts {

  case class BreakdownItem(
    name: String,
    year: Int,
    month: Int,
    day: Int,
    counts: Seq[String],
    breakdown_total: Seq[String]
  )
  object BreakdownItem {
    implicit val reads = Json.reads[BreakdownItem]
  }
  case class PageViewsPerVisit(
    date: String,
    pageViewsPerVisit: Double
  )

  def renderGalleryDashboard() = AuthActions.AuthActionTest { request =>

    val breakdown: Seq[(String, Map[String, Seq[BreakdownItem]])] = for {
      reportName <- List("GalleryPageViews", "GalleryVisits")
      report <- jobs.OmnitureReportJob.getReport(reportName)
    } yield {
      // The breakdown is a JSArray of objects which we can extract data from.
      val breakdown = ((report \ "report" \ "data")(0) \ "breakdown").validate[Seq[BreakdownItem]].getOrElse(Nil)
      (reportName, breakdown.groupBy(_.name))
    }

    val breakdownMap = breakdown.toMap
    val reportsObject = for {
      name <- breakdownMap.get("GalleryVisits").map(_.keys).getOrElse(Nil)
      galleryViewsReport <- breakdownMap.get("GalleryPageViews")
      galleryVisitsReport <- breakdownMap.get("GalleryVisits")
      galleryViews: BreakdownItem <- galleryViewsReport.get(name).flatMap(_.headOption)
      galleryVisits: BreakdownItem <- galleryVisitsReport.get(name).flatMap(_.headOption)
      views <- galleryViews.counts.headOption.map(_.toDouble)
      visits <- galleryVisits.counts.headOption.map(_.toDouble)
    } yield {
      val date = new DateTime(galleryViews.year, galleryViews.month, galleryViews.day, 0, 0).toString("yyyy-MM-dd")
      PageViewsPerVisit(date, views / visits)
    }

    if (reportsObject.isEmpty) {
      NoCache(Ok("Reports not generated yet"))
    } else {
      val rowData = reportsObject.toSeq.sortBy(_.date).map { row => tools.ChartRow(row.date, Seq(row.pageViewsPerVisit)) }
      val chart = new GenericChart("Gallery Page Views per Visit", List("Time", "Hits per visit"), ChartFormat.SingleLineGreen, rowData)
      NoCache(Ok(views.html.contentGallery("PROD", chart, Some("Gallery Performance"))))
    }
  }
}
