package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit, GetMetricStatisticsRequest}
import org.joda.time.DateTime

object MemoryMetrics {

  def memory = loadBalancers.map{ loadBalancer =>
    new LineChart(s"${loadBalancer.name} JVM memory", Seq("Memory", "used (mb)", "max (mb)"),

      cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("ApplicationSystemMetrics")
        .withMetricName(s"${loadBalancer.project}-used-heap-memory")
        .withDimensions(stage),
        asyncHandler),

    cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
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
