package controllers.admin.commercial

import java.time.LocalDate

import common.Logging
import jobs.CommercialDfpReporting
import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc._
import tools.{Chart, ChartFormat, ChartRow}

class TeamKPIController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController
  with I18nSupport
  with Logging {

  def renderBaselineDashboard(): Action[AnyContent] = Action { implicit request =>
    // The test variants for the team KPIs are commercialBaselineControl-control and commercialBaselineVariant-variant.
    DashboardRenderer.renderDashboard("commercialBaseline", "Commercial Team Revenue KPI", "hotpink", "deepskyblue")
  }

  def renderPrebidDashboard(): Action[AnyContent] = Action { implicit request =>
    case class DataPoint(date: LocalDate, bidderName: String, impressionCount: Int, eCpm: Double)

    val dataPoints = (
      for {
        report <- CommercialDfpReporting.getCustomReport(CommercialDfpReporting.prebidBidderPerformance)
      } yield {
        report.flatMap { row =>
          val fields = row.fields
          for {
            date            <- fields.lift(0).map(LocalDate.parse(_))
            customCriteria  <- fields.lift(1)
            impressionCount <- fields.lift(3).map(_.toInt)
            eCpm            <- fields.lift(4).map(_.toDouble / 1000000.0d) // convert DFP micropounds to pounds
          } yield
            DataPoint(
              date = date,
              bidderName = customCriteria.stripPrefix("hb_bidder="),
              impressionCount = impressionCount,
              eCpm = eCpm
            )
        }
      }
    ).getOrElse(Nil)

    trait BidPerformanceChart extends Chart[LocalDate] {
      def formatRowKey(key: LocalDate): String =
        s"new Date(${key.getYear}, ${key.getMonthValue - 1}, ${key.getDayOfMonth})"
      val bidderNames = dataPoints.map(_.bidderName).distinct.sorted
      def labels      = "Date" +: bidderNames
      def format      = ChartFormat.MultiLine
    }

    val impressionChart = new BidPerformanceChart {
      val name = "Number of winning bids"
      val dataset = dataPoints
        .groupBy(_.date)
        .foldLeft(Seq.empty[ChartRow[LocalDate]]) {
          case (acc, (date, points)) =>
            val impressionCounts = bidderNames.foldLeft(Seq.empty[Double]) { (soFar, label) =>
              soFar :+ points.find(_.bidderName == label).map(_.impressionCount.toDouble).getOrElse(0d)
            }
            acc :+ ChartRow(date, impressionCounts)
        }
        .sortBy(_.rowKey.toEpochDay)
    }

    val cpmChart = new BidPerformanceChart {
      val name = "CPM"
      val dataset = dataPoints
        .groupBy(_.date)
        .foldLeft(Seq.empty[ChartRow[LocalDate]]) {
          case (acc, (date, points)) =>
            val cpms = bidderNames.foldLeft(Seq.empty[Double]) { (soFar, label) =>
              soFar :+ points.find(_.bidderName == label).map(_.eCpm).getOrElse(0d)
            }
            acc :+ ChartRow(date, cpms)
        }
        .sortBy(_.rowKey.toEpochDay)
    }

    val revenueChart = new BidPerformanceChart {
      val name = "Indicative revenue"
      val dataset = dataPoints
        .groupBy(_.date)
        .foldLeft(Seq.empty[ChartRow[LocalDate]]) {
          case (acc, (date, points)) =>
            val revenues = bidderNames.foldLeft(Seq.empty[Double]) { (soFar, label) =>
              soFar :+ points
                .find(_.bidderName == label)
                .map { point =>
                  point.impressionCount * point.eCpm / 1000
                }
                .getOrElse(0d)
            }
            acc :+ ChartRow(date, revenues)
        }
        .sortBy(_.rowKey.toEpochDay)
    }

    NoCache(
      Ok(
        views.html.dateLineCharts(
          charts = Seq(impressionChart, cpmChart, revenueChart),
          title = Some("Prebid Bidder Performance")
        )))
  }
}
