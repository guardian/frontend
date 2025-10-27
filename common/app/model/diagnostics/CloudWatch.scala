package model.diagnostics

import common.GuLogging
import conf.Configuration
import conf.Configuration._
import metrics.{FrontendMetric, FrontendStatisticSet}
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient
import software.amazon.awssdk.services.cloudwatch.model.{Dimension, MetricDatum, PutMetricDataRequest, StatisticSet}
import utils.AWSv2

import scala.jdk.CollectionConverters._
import scala.util.{Failure, Success, Try}

trait CloudWatch extends GuLogging {

  lazy val stageDimension = Dimension.builder().name("Stage").value(environment.stage).build()

  lazy val cloudwatch: CloudWatchAsyncClient =
    CloudWatchAsyncClient
      .builder()
      .credentialsProvider(AWSv2.credentials)
      .region(Region.of(conf.Configuration.aws.region))
      .build()

  def putMetrics(metricNamespace: String, metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    if (Configuration.environment.isProd) {
      putMetricsWithStage(metricNamespace, metrics, dimensions :+ stageDimension)
    } else {
      log.info(s"Logging suppressed outside Prod environment. namespace: $metricNamespace")
    }
  }

  private def putMetricsWithStage(
      metricNamespace: String,
      metrics: List[FrontendMetric],
      dimensions: List[Dimension],
  ): Unit = {
    for {
      metricGroup <- metrics.filterNot(_.isEmpty).grouped(20)
    } {
      val metricsAsStatistics: List[FrontendStatisticSet] =
        metricGroup.map(metric => FrontendStatisticSet(metric.getAndResetDataPoints, metric.name, metric.metricUnit))

      val request =
        PutMetricDataRequest
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

      Try(CloudWatch.cloudwatch.putMetricData(request)) match {
        case Success(_) => log.info("CloudWatch PutMetricDataRequest - success")
        case Failure(e) =>
          log.warn(s"Failed to put ${metricsAsStatistics.size} metrics: $e")
          log.warn(s"Failed to put ${metricsAsStatistics.map(_.name).mkString(",")}")
          log.info(s"CloudWatch PutMetricDataRequest error: ${e.getMessage}}")
      }
    }
  }

  private def frontendMetricToStatisticSet(metricStatistics: FrontendStatisticSet): StatisticSet =
    StatisticSet
      .builder()
      .maximum(metricStatistics.maximum)
      .minimum(metricStatistics.minimum)
      .sampleCount(metricStatistics.sampleCount)
      .sum(metricStatistics.sum)
      .build()

}

object CloudWatch extends CloudWatch
