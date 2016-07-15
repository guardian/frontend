package awswrappers

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._

import scala.concurrent.Future

/** NB: We ought to switch to this library once we update to Scala 2.11.2:
  *
  * https://github.com/guardian/aws-sdk-scala-wrappers
  *
  * Then we can delete these manually written wrappers.
  */
object cloudwatch {
  implicit class RichAsyncCloudWatchClient(client: AmazonCloudWatchAsyncClient) {
    def putMetricDataFuture(request: PutMetricDataRequest): Future[PutMetricDataResult] =
      asFuture[PutMetricDataRequest, PutMetricDataResult](client.putMetricDataAsync(request, _))

    def getMetricStatisticsFuture(request: GetMetricStatisticsRequest): Future[GetMetricStatisticsResult] =
      asFuture[GetMetricStatisticsRequest, GetMetricStatisticsResult](client.getMetricStatisticsAsync(request, _))

    def listMetricsFuture(request: ListMetricsRequest): Future[ListMetricsResult] =
      asFuture[ListMetricsRequest, ListMetricsResult](client.listMetricsAsync(request, _))
  }
}
