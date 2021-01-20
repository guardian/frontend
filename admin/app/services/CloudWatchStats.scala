package services

import com.amazonaws.services.cloudwatch.{AmazonCloudWatchAsync, AmazonCloudWatchAsyncClient}
import com.amazonaws.services.cloudwatch.model._
import common.GuLogging
import conf.Configuration
import conf.Configuration.environment
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.concurrent.{ExecutionContext, Future}

object CloudWatchStats extends GuLogging {
  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudwatch: AmazonCloudWatchAsync = {
    AmazonCloudWatchAsyncClient
      .asyncBuilder()
      .withCredentials(Configuration.aws.mandatoryCredentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  private def sanityData(
      metric: String,
  )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] = {
    val ftr = cloudwatch.getMetricStatisticsFuture(
      new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusMinutes(15).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(900)
        .withStatistics("Sum")
        .withNamespace("Diagnostics")
        .withMetricName(metric)
        .withDimensions(stage),
    )

    ftr.failed.foreach { exception: Throwable =>
      log.error(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}", exception)
    }

    ftr
  }

  def rawPageViews()(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] =
    sanityData("kpis-page-views")

  def googleAnalyticsPageViews()(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] =
    sanityData("kpis-analytics-page-views-google")
}
