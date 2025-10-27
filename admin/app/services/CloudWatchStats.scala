package services

import common.GuLogging
import conf.Configuration.environment
import org.joda.time.DateTime
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.cloudwatch.CloudWatchAsyncClient
import software.amazon.awssdk.services.cloudwatch.model.{
  Dimension,
  GetMetricStatisticsRequest,
  GetMetricStatisticsResponse,
  Statistic,
}
import utils.AWSv2

import scala.jdk.FutureConverters._
import scala.concurrent.{ExecutionContext, Future}

object CloudWatchStats extends GuLogging {
  val stage = Dimension.builder().name("Stage").value(environment.stage).build()

  lazy val cloudwatch: CloudWatchAsyncClient = {
    CloudWatchAsyncClient
      .builder()
      .credentialsProvider(AWSv2.credentials)
      .region(Region.of(conf.Configuration.aws.region))
      .build()
  }

  private def sanityData(
      metric: String,
  )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResponse] = {
    val ftr = cloudwatch
      .getMetricStatistics(
        GetMetricStatisticsRequest
          .builder()
          .startTime(new DateTime().minusMinutes(15).toDate.toInstant)
          .endTime(new DateTime().toDate.toInstant)
          .period(900)
          .statistics(Statistic.SUM)
          .namespace("Diagnostics")
          .metricName(metric)
          .dimensions(stage)
          .build(),
      )
      .asScala

    ftr.failed.foreach { exception: Throwable =>
      log.error(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}", exception)
    }

    ftr
  }

  def rawPageViews()(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResponse] =
    sanityData("kpis-page-views")
}
