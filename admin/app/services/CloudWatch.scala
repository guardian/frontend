package services

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.handlers.AsyncHandler
import conf.{AdminHealthCheckPage, Configuration}
import com.amazonaws.services.cloudwatch.model._
import scala.collection.JavaConversions._
import common.Logging
import org.joda.time.DateTime
import conf.Configuration.environment
import scala.concurrent.Future

trait CloudWatch extends implicits.Futures {

  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  object PutHandler extends AsyncHandler[PutMetricDataRequest, Void] with Logging
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

      cloudwatch.putMetricDataAsync(request, PutHandler)

      // Now just forget about it.
    }
  }


  def rawPageViews: Future[GetMetricStatisticsResult] =
    cloudwatch.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusMinutes(15).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName("kpis-page-views")
      .withDimensions(stage),
      GetHandler).toScalaFuture

  def analyticsPageViews: Future[GetMetricStatisticsResult] =
    cloudwatch.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusMinutes(15).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName("kpis-analytics-page-views")
      .withDimensions(stage),
      GetHandler).toScalaFuture



  object GetHandler extends AsyncHandler[GetMetricStatisticsRequest, GetMetricStatisticsResult] with Logging {
    def onError(exception: Exception) {
      log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}")
      exception match {
        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        case e: Exception if e.getMessage.contains("JAXP00010001") => AdminHealthCheckPage.setUnhealthy()
        case _ =>
      }
    }
    def onSuccess(request: GetMetricStatisticsRequest, result: GetMetricStatisticsResult ) { }
  }

}

object CloudWatch extends CloudWatch
