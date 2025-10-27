package tools

import common.{Box, GuLogging}
import org.joda.time.DateTime
import software.amazon.awssdk.services.cloudwatch.model.{
  Dimension,
  GetMetricStatisticsRequest,
  GetMetricStatisticsResponse,
  ListMetricsRequest,
  ListMetricsResponse,
  Metric,
  Statistic,
}
import tools.CloudWatch._

import scala.jdk.FutureConverters._
import scala.jdk.CollectionConverters._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

case class AssetMetric(name: String, metric: GetMetricStatisticsResponse, yLabel: String) {
  lazy val chart = new AwsLineChart(name, Seq(yLabel, name), ChartFormat.SingleLineBlack, metric)
  lazy val change = BigDecimal(
    chart.dataset.last.values.headOption.getOrElse(0.0) - chart.dataset.head.values.headOption.getOrElse(0.0),
  ).setScale(2, BigDecimal.RoundingMode.HALF_UP).toFloat
}

object AssetMetrics {

  private val timePeriodInDays = 14 // Cloudwatch metric retention period is 14 days

  private val gzipped = Dimension.builder().name("Compression").value("GZip").build()

  private def fetchMetric(metric: Metric, dimension: Dimension)(implicit
      executionContext: ExecutionContext,
  ): Future[GetMetricStatisticsResponse] =
    withErrorLogging(
      euWestClient
        .getMetricStatistics(
          GetMetricStatisticsRequest
            .builder()
            .startTime(new DateTime().minusDays(timePeriodInDays).toDate.toInstant)
            .endTime(new DateTime().toDate.toInstant)
            .period(86400) // One day
            .statistics(Statistic.AVERAGE)
            .namespace("Assets")
            .metricName(metric.metricName())
            .dimensions(dimension)
            .build(),
        )
        .asScala,
    )

  private def allMetrics()(implicit executionContext: ExecutionContext): Future[ListMetricsResponse] =
    withErrorLogging(euWestClient.listMetrics(ListMetricsRequest.builder().namespace("Assets").build()).asScala)

  private def metricResults(
      dimension: Dimension,
  )(implicit executionContext: ExecutionContext): Future[List[GetMetricStatisticsResponse]] =
    allMetrics().flatMap { metricsList =>
      Future.sequence {
        metricsList
          .metrics()
          .asScala
          .filter(_.dimensions().contains(dimension))
          .toList
          .map { metric =>
            fetchMetric(metric, dimension)
          }
      }
    }

  private def metrics(dimension: Dimension, yLabel: String = "")(implicit
      executionContext: ExecutionContext,
  ): Future[List[AssetMetric]] =
    metricResults(dimension).map(
      _.map { result =>
        AssetMetric(result.label(), result, yLabel)
      },
    )

  // Public methods

  def sizeMetrics()(implicit executionContext: ExecutionContext): Future[List[AssetMetric]] =
    metrics(dimension = gzipped, yLabel = "Size").map(_.sortBy(m => (-m.change, m.name)))
}

object AssetMetricsCache extends GuLogging {

  sealed trait ReportType
  object ReportTypes {
    case object sizeOfFiles extends ReportType
  }

  private val cache = Box[Map[ReportType, List[AssetMetric]]](Map.empty)

  def run()(implicit executionContext: ExecutionContext): Future[Unit] = {
    AssetMetrics
      .sizeMetrics()
      .map { metrics =>
        log.info("Successfully refreshed Asset Metrics data")
        cache.send(cache.get() + (ReportTypes.sizeOfFiles -> metrics))
      }
      .recover { case NonFatal(e) =>
        log.error("Error refreshing Asset Metrics data", e)
      }
  }
}
