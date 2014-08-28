package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime

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

  def zipped(file: String) = new AwsDailyLineChart(file, Seq("Size", "Kb"), ChartFormat.SingleLineBlack, euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Compression").withValue("GZip")
    ),
    asyncHandler))

  def raw(file: String) = new AwsDailyLineChart(file, Seq("Size", "Kb"), ChartFormat.SingleLineBlack, euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Compression").withValue("None")
    ),
    asyncHandler))

  def rules(file: String) = new AwsDailyLineChart(file, Seq("Rules", "Count"), ChartFormat.SingleLineBlack, euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Metric").withValue("Rules")
    ),
    asyncHandler))

  def selectors(file: String) = new AwsDailyLineChart(file, Seq("Total selectors", "Count"), ChartFormat.SingleLineBlack, euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusDays(14).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(86400) //One day
    .withStatistics("Average")
    .withNamespace("Assets")
    .withMetricName(file)
    .withDimensions(
      new Dimension().withName("Metric").withValue("Total Selectors")
    ),
    asyncHandler))

  def assets = assetsFiles.map{ file =>
    new AssetData(file, raw(file), zipped(file), rules(file), selectors(file))
  }
}
