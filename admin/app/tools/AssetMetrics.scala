package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime

object AssetMetrics {

  def asset = assetsFiles.map{ file =>
    new LineChart(s"${file} size in Kb", Seq("Size", "GZip (kb)", "None (kb)"),

      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusDays(7).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(3600) //One hour
        .withStatistics("Average")
        .withNamespace("Assets")
        .withMetricName(file)
        .withDimensions(
          new Dimension().withName("Compression").withValue("GZip")
        ),
        asyncHandler),

      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusDays(7).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(3600) //One hour
        .withStatistics("Average")
        .withNamespace("Assets")
        .withMetricName(file)
        .withDimensions(
          new Dimension().withName("Compression").withValue("None")
        ),
        asyncHandler)
    )
  }

}
