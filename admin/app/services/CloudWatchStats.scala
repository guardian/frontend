package services

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.Configuration.environment
import controllers.HealthCheck
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.concurrent.Future

object CloudWatchStats extends Logging with ExecutionContexts {
  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
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

  def analyticsPageViews: Future[GetMetricStatisticsResult] = sanityData("kpis-analytics-page-views")

  def pageViewsHavingAnAd: Future[GetMetricStatisticsResult] = sanityData("first-ad-rendered")
}
