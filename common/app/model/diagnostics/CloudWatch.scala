package model.diagnostics

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.handlers.AsyncHandler
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import scala.collection.JavaConversions._
import common.Logging
import Configuration._
import services.AwsEndpoints

trait CloudWatch extends Logging {

  lazy val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  object asyncHandler extends AsyncHandler[PutMetricDataRequest, Void] with Logging
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

  def put(namespace: String, metrics: Map[String, Double]): Any =
    put(namespace, metrics, Seq(stage))

  def putWithDimensions(namespace: String, metrics: Map[String, Double], dimensions: Seq[Dimension]) =
    put(namespace, metrics, Seq(stage) ++ dimensions)

}

object CloudWatch extends CloudWatch
