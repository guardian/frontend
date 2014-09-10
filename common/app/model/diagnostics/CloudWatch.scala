package model.diagnostics

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.Logging
import conf.Configuration
import conf.Configuration._
import metrics.{DataPoint, FrontendMetric}
import services.AwsEndpoints

import scala.collection.JavaConversions._

trait CloudWatch extends Logging {

  lazy val stageDimension = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch: Option[AmazonCloudWatchAsyncClient] = Configuration.aws.credentials.map{ credentials =>
    val client = new AmazonCloudWatchAsyncClient(credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  trait LoggingAsyncHandler extends AsyncHandler[PutMetricDataRequest, Void] with Logging
  {
    def onError(exception: Exception)
    {
      log.info(s"CloudWatch PutMetricDataRequest error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutMetricDataRequest, result: Void )
    {
      log.info("CloudWatch PutMetricDataRequest - success")
    }
  }

  object LoggingAsyncHandler extends LoggingAsyncHandler

  case class AsyncHandlerForMetric(metric: FrontendMetric, points: List[DataPoint]) extends LoggingAsyncHandler {
    override def onError(exception: Exception) = {
      metric.putDataPoints(points)
      log.warn(s"Failed to put ${metric.name}: $exception")
      super.onError(exception)
    }
    override def onSuccess(request: PutMetricDataRequest, result: Void ) = {
      log.info(s"Successfully put ${metric.name}")
      super.onSuccess(request, result)
    }
  }

  def put(namespace: String, metrics: Map[String, Double], dimensions: Seq[Dimension]): Any = {
    val request = new PutMetricDataRequest().
      withNamespace(namespace).
      withMetricData(metrics.map{ case (name, count) =>
      new MetricDatum()
        .withValue(count)
        .withMetricName(name)
        .withUnit("Count")
        .withDimensions(dimensions)
    })

    cloudwatch.foreach(_.putMetricDataAsync(request, LoggingAsyncHandler))
  }

  def put(namespace: String, metrics: Map[String, Double]): Unit =
    put(namespace, metrics, Seq(stageDimension))

  def putWithDimensions(namespace: String, metrics: Map[String, Double], dimensions: Seq[Dimension]): Unit =
    put(namespace, metrics, Seq(stageDimension) ++ dimensions)


  def putMetricsWithStage(metrics: List[FrontendMetric], applicationDimension: Dimension): Unit =
    putMetrics("Application", metrics, List(stageDimension, applicationDimension))

  def putSystemMetricsWithStage(metrics: List[FrontendMetric], applicationDimension: Dimension): Unit =
    putMetrics("ApplicationSystemMetrics", metrics, List(stageDimension, applicationDimension))

  def putMetrics(metricNamespace: String, metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    for {
      metric <- metrics
      dataPointGroup <- metric.getAndResetDataPoints.grouped(20)
    } {
      val request = new PutMetricDataRequest()
        .withNamespace(metricNamespace)
        .withMetricData {
          for (dataPoint <- dataPointGroup) yield {
            val metricDatum = new MetricDatum()
              .withValue(dataPoint.value)
              .withUnit(metric.metricUnit)
              .withMetricName(metric.name)
              .withDimensions(dimensions)

            dataPoint.time.fold(metricDatum) { t => metricDatum.withTimestamp(t.toDate)}
          }
        }
      CloudWatch.cloudwatch.foreach(_.putMetricDataAsync(request, AsyncHandlerForMetric(metric, dataPointGroup)))
    }
  }

}

object CloudWatch extends CloudWatch
