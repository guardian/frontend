package services

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.Logging
import conf.Configuration
import conf.Configuration.environment
import controllers.HealthCheck
import org.joda.time.DateTime

import scala.collection.JavaConversions._
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


  private def sanityData(metric: String) = cloudwatch.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusMinutes(15).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(900)
    .withStatistics("Sum")
    .withNamespace("Diagnostics")
    .withMetricName(metric)
    .withDimensions(stage),
    GetHandler).toScalaFuture


  def rawPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-page-views")

  def videoPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-video-page-views")

  def analyticsPageViews: Future[GetMetricStatisticsResult] =sanityData("kpis-analytics-page-views")

  def videoStarts: Future[GetMetricStatisticsResult] =sanityData("kpis-video-starts")

  def videoEnds: Future[GetMetricStatisticsResult] =sanityData("kpis-video-ends")

  def videoPrerollStarts: Future[GetMetricStatisticsResult] =sanityData("kpis-video-preroll-start")

  def videoPrerollEnds: Future[GetMetricStatisticsResult] =sanityData("kpis-video-preroll-end")

  object GetHandler extends AsyncHandler[GetMetricStatisticsRequest, GetMetricStatisticsResult] with Logging {
    def onError(exception: Exception) {
      log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}")
      exception match {
        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        case e: Exception if e.getMessage.contains("JAXP00010001") => HealthCheck.setUnhealthy()
        case _ =>
      }
    }
    def onSuccess(request: GetMetricStatisticsRequest, result: GetMetricStatisticsResult ) { }
  }

}

object CloudWatch extends CloudWatch
