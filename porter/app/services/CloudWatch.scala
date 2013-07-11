package services

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import scala.collection.JavaConversions._

trait CloudWatch {

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    client
  }

  def put(namespage: String, statistics: List[FastlyStatistic]) {
    // CloudWatch limits to 20 metric values per request
    (statistics grouped 20) foreach { batch =>
      val request = new PutMetricDataRequest().
        withNamespace(namespage).
        withMetricData(batch map { _.metric })

      cloudwatch.putMetricDataAsync(request)

      // Now just forget about it.
    }
  }
}

object CloudWatch extends CloudWatch
