package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest
import org.joda.time.DateTime

object MemoryMetrics {

  def memory = loadBalancers.map{ loadBalancer =>
    new AwsLineChart(s"${loadBalancer.name} JVM memory", Seq("Memory", "used (mb)", "max (mb)"), ChartFormat.DoubleLineBlueRed,

      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("ApplicationSystemMetrics")
        .withMetricName(s"${loadBalancer.project}-used-heap-memory")
        .withDimensions(stage),
        asyncHandler),

    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(3).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Average")
      .withNamespace("ApplicationSystemMetrics")
      .withMetricName(s"${loadBalancer.project}-max-heap-memory")
      .withDimensions(stage),
      asyncHandler)
    )
  }

}
