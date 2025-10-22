package model.diagnostics

import common.GuLogging
import conf.Configuration
import conf.Configuration.environment
import metrics.{FrontendMetricV2, FrontendStatisticSetV2}
import software.amazon.awssdk.services.cloudwatch.model.{Dimension, MetricDatum, PutMetricDataRequest, StatisticSet}
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient
import utils.AWSv2
import software.amazon.awssdk.regions.Region

import scala.jdk.CollectionConverters._
import scala.util.{Failure, Success, Try}

trait CloudWatchV2 extends GuLogging {
  lazy val stageDimension = Dimension.builder().name("Stage").value(environment.stage).build()

  lazy val cloudwatchClient: CloudWatchAsyncClient =
    CloudWatchAsyncClient
      .builder()
      .credentialsProvider(AWSv2.credentials)
      .region(Region.of(conf.Configuration.aws.region))
      .build()

  def putMetrics(metricNamespace: String, metrics: List[FrontendMetricV2], dimensions: List[Dimension]): Unit = {
    if (Configuration.environment.isProd) {
      putMetricsWithStage(metricNamespace, metrics, dimensions :+ stageDimension)
    } else {
      log.info(s"Logging suppressed outside Prod environment. namespace: $metricNamespace")
    }
  }

  private def putMetricsWithStage(
      metricNamespace: String,
      metrics: List[FrontendMetricV2],
      dimensions: List[Dimension],
  ): Unit = {
    for {
      metricGroup <- metrics.filterNot(_.isEmpty).grouped(20)
    } {
      val metricsAsStatistics: List[FrontendStatisticSetV2] =
        metricGroup.map(metric => FrontendStatisticSetV2(metric.getAndResetDataPoints, metric.name, metric.metricUnit))

      val request = PutMetricDataRequest
        .builder()
        .namespace(metricNamespace)
        .metricData {
          val metricDatum = for (metricStatistic <- metricsAsStatistics) yield {

            MetricDatum
              .builder()
              .statisticValues(frontendMetricToStatisticSet(metricStatistic))
              .unit(metricStatistic.unit)
              .metricName(metricStatistic.name)
              .dimensions(dimensions.asJava)
              .build()
          }
          metricDatum.asJava
        }
        .build()

      Try(CloudWatchV2.cloudwatchClient.putMetricData(request)) match {
        case Success(_) => log.info("CloudWatch PutMetricDataRequest - success")
        case Failure(e) =>
          log.warn(s"Failed to put ${metricsAsStatistics.size} metrics: $e")
          log.warn(s"Failed to put ${metricsAsStatistics.map(_.name).mkString(",")}")
          log.info(s"CloudWatch PutMetricDataRequest error: ${e.getMessage}}")
      }
    }
  }

  private def frontendMetricToStatisticSet(metricStatistics: FrontendStatisticSetV2): StatisticSet =
    StatisticSet
      .builder()
      .maximum(metricStatistics.maximum)
      .minimum(metricStatistics.minimum)
      .sampleCount(metricStatistics.sampleCount)
      .sum(metricStatistics.sum)
      .build()
}

object CloudWatchV2 extends CloudWatchV2
