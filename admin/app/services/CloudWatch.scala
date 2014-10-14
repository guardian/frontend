package services

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.Configuration.environment
import controllers.HealthCheck
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.collection.JavaConversions._
import scala.concurrent.Future

trait CloudWatch extends Logging with ExecutionContexts {
  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  def put(namespage: String, statistics: List[FastlyStatistic]) {
    // CloudWatch limits to 20 metric values per request
    (statistics grouped 20) foreach { batch =>
      val request = new PutMetricDataRequest().
        withNamespace(namespage).
        withMetricData(batch map { _.metric })

      cloudwatch.putMetricDataFuture(request) onFailure {
        case error: Exception =>
          log.info(s"CloudWatch PutMetricDataRequest error: ${error.getMessage}}")
      }
    }
  }

  private def sanityData(metric: String) = {
    val ftr = cloudwatch.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusMinutes(15).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName(metric)
      .withDimensions(stage))

    ftr onFailure {
      case exception: Exception =>
        log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}")

        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        if (exception.getMessage.contains("JAXP00010001")) {
          HealthCheck.break()
        }
    }

    ftr
  }

  def rawPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-page-views")

  def videoPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-video-page-views")

  def analyticsPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-analytics-page-views")

  def videoStarts: Future[GetMetricStatisticsResult] = sanityData("kpis-video-starts")

  def videoEnds: Future[GetMetricStatisticsResult] = sanityData("kpis-video-ends")

  def videoPrerollStarts: Future[GetMetricStatisticsResult] = sanityData("kpis-video-preroll-start")

  def videoPrerollEnds: Future[GetMetricStatisticsResult] = sanityData("kpis-video-preroll-end")
}

object CloudWatch extends CloudWatch
