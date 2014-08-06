package model.diagnostics

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.handlers.AsyncHandler
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import metrics.FrontendMetric
import scala.collection.JavaConversions._
import common.Logging
import Configuration._
import services.AwsEndpoints

trait CloudWatch extends Logging {

  lazy val stageDimension = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  trait asyncHandler extends AsyncHandler[PutMetricDataRequest, Void] with Logging
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

  object asyncHandler extends asyncHandler

  case class asyncHandlerForMetric(metric: FrontendMetric, points: List[DataPoint]) extends asyncHandler {
    override def onError(exception: Exception) = {
      metric.putDataPoints(points)
      super.onError(exception)
    }
    override def onSuccess(request: PutMetricDataRequest, result: Void ) = super.onSuccess(request, result)
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

    cloudwatch.putMetricDataAsync(request, asyncHandler)
  }

  def put(namespace: String, metrics: Map[String, Double]): Unit =
    put(namespace, metrics, Seq(stageDimension))

  def putWithDimensions(namespace: String, metrics: Map[String, Double], dimensions: Seq[Dimension]): Unit =
    put(namespace, metrics, Seq(stageDimension) ++ dimensions)


  def putMetricsWithStage(metrics: List[FrontendMetric], applicationDimension: Dimension): Unit =
    putMetrics(metrics, List(stageDimension, applicationDimension))

  def putMetrics(metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    for {
      metric <- metrics
      dataPoints <- metric.getDataPoints.grouped(20)
      dataPoint <- dataPoints
    } {
      val request = new PutMetricDataRequest()
        .withNamespace("Application")
        .withMetricData {
        val metricDatum = new MetricDatum()
          .withValue(dataPoint.value)
          .withUnit(metric.metricUnit)
          .withMetricName(metric.name)
          .withDimensions(dimensions)

        dataPoint.time.fold(metricDatum) { t => metricDatum.withTimestamp(t.toDate)}
      }

      CloudWatch.cloudwatch.putMetricDataAsync(request, asyncHandler)
    }
  }

}

object CloudWatch extends CloudWatch
