package jobs

import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.{GetMetricStatisticsResult, StandardUnit}
import common.Logging
import metrics.GaugeMetric
import model.diagnostics.CloudWatch
import org.joda.time.DateTime
import services.{CloudWatchStats, OphanApi}

import scala.collection.JavaConversions._
import scala.concurrent.{ExecutionContext, Future}

class AnalyticsSanityCheckJob(ophanApi: OphanApi) extends Logging {

  private val rawPageViews = new AtomicLong(0L)
  private val ophanPageViews = new AtomicLong(0L)
  private val googlePageViews = new AtomicLong(0L)

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

  def run()(implicit executionContext: ExecutionContext) {

    val fRawPageViews: Future[GetMetricStatisticsResult] = CloudWatchStats.rawPageViews()
    val fGooglePageViews = CloudWatchStats.googleAnalyticsPageViews()
    val fOphanViews = ophanViews()
    for {
      rawPageViewsStats <- fRawPageViews
      googlePageViewsStats <- fGooglePageViews
      ophanViewsCount <- fOphanViews
    } yield {

      def metricLastSum(stats: GetMetricStatisticsResult): Long = stats.getDatapoints.headOption.map(_.getSum.longValue).getOrElse(0L)

      rawPageViews.set(metricLastSum(rawPageViewsStats))
      googlePageViews.set(metricLastSum(googlePageViewsStats))
      ophanPageViews.set(ophanViewsCount)

      CloudWatch.putMetrics("Analytics", List(ophanConversionRate, googleConversionRate), List.empty)
    }

  }

  private def ophanViews()(implicit executionContext: ExecutionContext): Future[Long] = {
    val now = new DateTime().minusMinutes(15).getMillis
    ophanApi.getBreakdown("next-gen", hours = 1).map { json =>
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
