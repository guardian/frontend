package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.concurrent.Future

case class AssetData(
  name: String,
  raw: AwsDailyLineChart,
  zipped: AwsDailyLineChart,
  rules: AwsDailyLineChart,
  selectors: AwsDailyLineChart
) {
  def combined: AwsDailyLineChart = new AwsDailyLineChart(name, Seq("Size", "GZip (kb)", "None (kb)"), ChartFormat.DoubleLineBlueRed, raw.charts.head, zipped.charts.head)
  lazy val isCSS = name.endsWith(".css")
  lazy val isJS = name.endsWith(".js")
  lazy val rawChange = (raw.dataset.last.values.headOption.getOrElse(0.0) - raw.dataset.head.values.headOption.getOrElse(0.0)).toFloat
  lazy val isPositiveChange = rawChange <= -0.00
}

object AssetMetrics {

  def zipped(file: String) = withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Compression").withValue("GZip")
    )) map { metric =>
    new AwsDailyLineChart(file, Seq("Size", "Kb"), ChartFormat.SingleLineBlack, metric)
  })

  def raw(file: String) = withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Compression").withValue("None")
    )) map { metric =>
    new AwsDailyLineChart(file, Seq("Size", "Kb"), ChartFormat.SingleLineBlack, metric)
  })

  def rules(file: String) = withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) // One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Metric").withValue("Rules")
    )) map { metric =>
    new AwsDailyLineChart(file, Seq("Rules", "Count"), ChartFormat.SingleLineBlack, metric)
  })

  def selectors(file: String) = withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Metric").withValue("Total Selectors")
    )) map { metric =>
    new AwsDailyLineChart(file, Seq("Total selectors", "Count"), ChartFormat.SingleLineBlack, metric)
  })

  def assets = Future.traverse(assetsFiles) { file =>
    for {
      r <- raw(file)
      z <- zipped(file)
      rs <- rules(file)
      ss <- selectors(file)
    } yield new AssetData(file, r, z, rs, ss)
  }
}
