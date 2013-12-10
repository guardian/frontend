package services

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.handlers.AsyncHandler
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import scala.collection.JavaConversions._
import common.Logging

trait CloudWatch {

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint("monitoring.eu-west-1.amazonaws.com")
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
    }
  }

  def put(namespage: String, statistics: List[FastlyStatistic]) {
    // CloudWatch limits to 20 metric values per request
    (statistics grouped 20) foreach { batch =>
      val request = new PutMetricDataRequest().
        withNamespace(namespage).
        withMetricData(batch map { _.metric })

      cloudwatch.putMetricDataAsync(request, asyncHandler)

      // Now just forget about it.
    }
  }
}

object CloudWatch extends CloudWatch
