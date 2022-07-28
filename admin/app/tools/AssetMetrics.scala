package tools

import awswrappers.cloudwatch._
import com.amazonaws.services.cloudwatch.model._
import common.{Box, GuLogging}
import org.joda.time.DateTime
import tools.CloudWatch._

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future}
import scala.math.BigDecimal
import scala.util.control.NonFatal

case class AssetMetric(name: String, metric: GetMetricStatisticsResult, yLabel: String) {
  lazy val chart = new AwsLineChart(name, Seq(yLabel, name), ChartFormat.SingleLineBlack, metric)
  lazy val change = BigDecimal(
    chart.dataset.last.values.headOption.getOrElse(0.0) - chart.dataset.head.values.headOption.getOrElse(0.0),
  ).setScale(2, BigDecimal.RoundingMode.HALF_UP).toFloat
}

object AssetMetrics {

  private val timePeriodInDays = 14 // Cloudwatch metric retention period is 14 days

  private val gzipped = new Dimension().withName("Compression").withValue("GZip")
  private val raw = new Dimension().withName("Compression").withValue("None")
  private val rules = new Dimension().withName("Metric").withValue("Rules")
  private val selectors = new Dimension().withName("Metric").withValue("Total Selectors")

  private def fetchMetric(metric: Metric, dimension: Dimension)(implicit
      executionContext: ExecutionContext,
  ): Future[GetMetricStatisticsResult] =
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(
        new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusDays(timePeriodInDays).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(86400) //One day
          .withStatistics("Average")
          .withNamespace("Assets")
          .withMetricName(metric.getMetricName)
          .withDimensions(dimension),
      ),
    )

  private def allMetrics()(implicit executionContext: ExecutionContext): Future[ListMetricsResult] =
    withErrorLogging(euWestClient.listMetricsFuture(new ListMetricsRequest().withNamespace("Assets")))

  private def metricResults(
      dimension: Dimension,
  )(implicit executionContext: ExecutionContext): Future[List[GetMetricStatisticsResult]] =
    allMetrics().flatMap { metricsList =>
      Future.sequence {
        metricsList.getMetrics.asScala
          .filter(_.getDimensions.contains(dimension))
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
        AssetMetric(result.getLabel, result, yLabel)
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

  private def getReport(reportType: ReportType): Option[List[AssetMetric]] = cache().get(reportType)

  def run()(implicit executionContext: ExecutionContext): Future[Unit] = {
    AssetMetrics
      .sizeMetrics()
      .map { metrics =>
        log.info("Successfully refreshed Asset Metrics data")
        cache.send(cache.get + (ReportTypes.sizeOfFiles -> metrics))
      }
      .recover {
        case NonFatal(e) =>
          log.error("Error refreshing Asset Metrics data", e)
      }
  }

  def sizes: List[AssetMetric] = getReport(ReportTypes.sizeOfFiles).getOrElse(List.empty[AssetMetric])

}
