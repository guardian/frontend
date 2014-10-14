package tools

import tools.CloudWatch._
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest
import common.ExecutionContexts
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.concurrent.Future

object MemoryMetrics extends ExecutionContexts {
  def memory = withErrorLogging(Future.traverse(loadBalancers) { loadBalancer =>
    for {
      usedHeapMemory <- euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("ApplicationSystemMetrics")
        .withMetricName(s"${loadBalancer.project}-used-heap-memory")
        .withDimensions(stage))

      maxHeapMemory <- euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("ApplicationSystemMetrics")
        .withMetricName(s"${loadBalancer.project}-max-heap-memory")
        .withDimensions(stage))
    } yield new AwsLineChart(
      s"${loadBalancer.name} JVM memory",
      Seq("Memory", "used (mb)", "max (mb)"),
      ChartFormat.DoubleLineBlueRed,
      usedHeapMemory,
      maxHeapMemory
    )
  })
}
