package model.diagnostics

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.Logging
import conf.Configuration
import conf.Configuration._
import metrics.{FrontendStatisticSet, FrontendMetric}
import services.AwsEndpoints

import scala.collection.JavaConversions._

trait CloudWatch extends Logging {

  lazy val stageDimension = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch: Option[AmazonCloudWatchAsyncClient] = Configuration.aws.credentials.map{ credentials =>
    val client = new AmazonCloudWatchAsyncClient(credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  trait LoggingAsyncHandler extends AsyncHandler[PutMetricDataRequest, PutMetricDataResult] with Logging
  {
    def onError(exception: Exception)
    {
      log.info(s"CloudWatch PutMetricDataRequest error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutMetricDataRequest, result: PutMetricDataResult )
    {
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

  private def putMetricsWithStage(metricNamespace: String, metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    for {
      metricGroup <- metrics.filterNot(_.isEmpty).grouped(20)
    } {
      val metricsAsStatistics: List[FrontendStatisticSet] =
        metricGroup.map( metric => FrontendStatisticSet(
          metric.getAndResetDataPoints,
          metric.name,
          metric.metricUnit))

      val request = new PutMetricDataRequest()
        .withNamespace(metricNamespace)
        .withMetricData {
          for(metricStatistic <- metricsAsStatistics) yield {
            new MetricDatum()
              .withStatisticValues(frontendMetricToStatisticSet(metricStatistic))
              .withUnit(metricStatistic.unit)
              .withMetricName(metricStatistic.name)
              .withDimensions(dimensions)
          }
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
