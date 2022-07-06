package model.diagnostics

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.{AmazonCloudWatchAsync, AmazonCloudWatchAsyncClient}
import com.amazonaws.services.cloudwatch.model._
import common.GuLogging
import conf.Configuration
import conf.Configuration._
import metrics.{FrontendMetric, FrontendStatisticSet}

import scala.collection.JavaConverters._

trait CloudWatch extends GuLogging {

  lazy val stageDimension = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch: Option[AmazonCloudWatchAsync] = Configuration.aws.credentials.map { credentials =>
    AmazonCloudWatchAsyncClient
      .asyncBuilder()
      .withCredentials(credentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  trait LoggingAsyncHandler extends AsyncHandler[PutMetricDataRequest, PutMetricDataResult] with GuLogging {
    def onError(exception: Exception): Unit = {
      log.info(s"CloudWatch PutMetricDataRequest error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutMetricDataRequest, result: PutMetricDataResult): Unit = {
      log.info("CloudWatch PutMetricDataRequest - success")
    }
  }

  object LoggingAsyncHandler extends LoggingAsyncHandler

  case class AsyncHandlerForMetric(frontendStatisticSets: List[FrontendStatisticSet]) extends LoggingAsyncHandler {
    override def onError(exception: Exception): Unit = {
      log.warn(s"Failed to put ${frontendStatisticSets.size} metrics: $exception")
      log.warn(s"Failed to put ${frontendStatisticSets.map(_.name).mkString(",")}")
      super.onError(exception)
    }
  }

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

      val request = new PutMetricDataRequest()
        .withNamespace(metricNamespace)
        .withMetricData {
          val metricDatum = for (metricStatistic <- metricsAsStatistics) yield {
            new MetricDatum()
              .withStatisticValues(frontendMetricToStatisticSet(metricStatistic))
              .withUnit(metricStatistic.unit)
              .withMetricName(metricStatistic.name)
              .withDimensions(dimensions.asJava)
          }
          metricDatum.asJava
        }
      CloudWatch.cloudwatch.foreach(_.putMetricDataAsync(request, AsyncHandlerForMetric(metricsAsStatistics)))
    }
  }

  private def frontendMetricToStatisticSet(metricStatistics: FrontendStatisticSet): StatisticSet =
    new StatisticSet()
      .withMaximum(metricStatistics.maximum)
      .withMinimum(metricStatistics.minimum)
      .withSampleCount(metricStatistics.sampleCount)
      .withSum(metricStatistics.sum)

}

object CloudWatch extends CloudWatch
