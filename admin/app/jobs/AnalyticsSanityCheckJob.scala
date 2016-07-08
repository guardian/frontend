package jobs

import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.{ExecutionContexts, Logging}
import metrics.GaugeMetric
import model.diagnostics.CloudWatch
import org.joda.time.DateTime
import services.{CloudWatchStats, OphanApi}

import scala.collection.JavaConversions._
import scala.concurrent.Future

object AnalyticsSanityCheckJob extends ExecutionContexts with Logging {

  private val rawPageViews = new AtomicLong(0L)
  private val omniturePageViews = new AtomicLong(0L)
  private val ophanPageViews = new AtomicLong(0L)
  private val googlePageViews = new AtomicLong(0L)

  val omnitureConversionRate = GaugeMetric(
    name = "omniture-percent-conversion",
    description = "The percentage of raw page views that contain a recorded Omniture page view",
    metricUnit = StandardUnit.Percent,
    get = () => {
      omniturePageViews.get.toDouble / rawPageViews.get.toDouble * 100.0d
    }
  )

  val ophanConversionRate = GaugeMetric(
    name = "ophan-percent-conversion",
    description = "The percentage of raw page views that contain a recorded Ophan page view",
    metricUnit = StandardUnit.Percent,
    get = () => {
      ophanPageViews.get.toDouble / rawPageViews.get.toDouble * 100.0d
    }
  )

  val googleConversionRate = GaugeMetric(
    name = "google-percent-conversion",
    description = "The percentage of raw page views that contain a recorded Google Analytics page view",
    metricUnit = StandardUnit.Percent,
    get = () => {
      googlePageViews.get.toDouble / rawPageViews.get.toDouble * 100.0d
    }
  )

  def run() {

    // Update rawPageViews.
    CloudWatchStats.rawPageViews.foreach { stats =>
      val views = stats.getDatapoints.headOption.map(_.getSum.longValue).getOrElse(0L)
      rawPageViews.set(views)
    }

    // Update omniturePageViews.
    CloudWatchStats.analyticsPageViews.foreach { stats =>
      val views = stats.getDatapoints.headOption.map(_.getSum.longValue).getOrElse(0L)
      omniturePageViews.set(views)
    }

    // Update googlePageViews.
    CloudWatchStats.googleAnalyticsPageViews.foreach { stats =>
      val views = stats.getDatapoints.headOption.map(_.getSum.longValue).getOrElse(0L)
      googlePageViews.set(views)
    }

    // Update ophanPageViews.
    ophanViews.foreach { views =>
      ophanPageViews.set(views)
    }

    CloudWatch.putMetrics("Analytics", List(ophanConversionRate, omnitureConversionRate, googleConversionRate), List.empty)
  }

  private def ophanViews: Future[Long] = {
    val now = new DateTime().minusMinutes(15).getMillis
    OphanApi.getBreakdown("next-gen", hours = 1).map { json =>
      (json \\ "data").flatMap {
        line =>
          val recent = line.asInstanceOf[play.api.libs.json.JsArray].value.filter {
            entry =>
              (entry \ "dateTime").as[Long] > now
          }
          recent.map(r => (r \ "count").as[Long])
      }.sum
    }
  }
}
