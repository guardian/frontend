package jobs

import software.amazon.awssdk.services.cloudwatch.model.StandardUnit
import com.madgag.scala.collection.decorators.MapDecorator
import common.GuLogging
import metrics.SamplerMetricV2
import model.diagnostics.CloudWatchV2
import services.{FastlyStatistic, FastlyStatisticService}

import scala.collection.mutable
import conf.Configuration
import org.joda.time.DateTime

import scala.concurrent.ExecutionContext

class FastlyCloudwatchLoadJob(fastlyStatisticService: FastlyStatisticService) extends GuLogging {
  // Samples in CloudWatch are additive so we want to limit duplicate reporting.
  // We do not want to corrupt the past either, so set a default value (the most
  // recent 15 minutes of results are unstable).

  // This key is (service, name, region)
  val latestTimestampsSent =
    mutable.Map[(String, String, String), Long]().withDefaultValue(DateTime.now().minusMinutes(15).getMillis())

  // Be very explicit about which metrics we want. It is not necessary to cloudwatch everything.
  val allFastlyMetrics: List[SamplerMetricV2] = List(
    SamplerMetricV2("usa-hits", StandardUnit.COUNT),
    SamplerMetricV2("usa-miss", StandardUnit.COUNT),
    SamplerMetricV2("usa-errors", StandardUnit.COUNT),
    SamplerMetricV2("europe-hits", StandardUnit.COUNT),
    SamplerMetricV2("europe-miss", StandardUnit.COUNT),
    SamplerMetricV2("europe-errors", StandardUnit.COUNT),
    SamplerMetricV2("ausnz-hits", StandardUnit.COUNT),
    SamplerMetricV2("ausnz-miss", StandardUnit.COUNT),
    SamplerMetricV2("ausnz-errors", StandardUnit.COUNT),
  )

  private def updateMetricFromStatistic(stat: FastlyStatistic): Unit = {
    val maybeMetric: Option[SamplerMetricV2] = allFastlyMetrics.find { metric =>
      metric.name == s"${stat.region}-${stat.name}"
    }

    maybeMetric.foreach { metric =>
      metric.recordSample(stat.value.toDouble, new DateTime(stat.timestamp))
    }
  }

  def run()(implicit executionContext: ExecutionContext): Unit = {
    log.info("Loading statistics from Fastly to CloudWatch.")
    fastlyStatisticService.fetch().map { statistics =>
      val fresh: List[FastlyStatistic] = statistics filter { statistic =>
        latestTimestampsSent(statistic.key) < statistic.timestamp
      }

      log.info("Uploading %d new metric data points" format fresh.size)

      if (Configuration.environment.isProd) {
        fresh.foreach { updateMetricFromStatistic }
        CloudWatchV2.putMetricsV2("Fastly", allFastlyMetrics, List.empty)
      } else {
        log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
      }

      val groups = fresh groupBy { _.key }
      val timestampsSent = groups mapV { _ map { _.timestamp } }
      timestampsSent mapV { _.max } foreach { case (key, value) =>
        latestTimestampsSent.update(key, value)
      }
    }
  }
}
