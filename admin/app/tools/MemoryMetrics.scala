package tools

import tools.CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
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
        .withNamespace("Application")
        .withMetricName("used-heap-memory")
        .withDimensions(stage, new Dimension().withName("ApplicationName").withValue(loadBalancer.project)))

      maxHeapMemory <- euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("Application")
        .withMetricName("max-heap-memory")
        .withDimensions(stage, new Dimension().withName("ApplicationName").withValue(loadBalancer.project)))
    } yield new AwsLineChart(
      s"${loadBalancer.name} JVM memory",
      Seq("Memory", "used (mb)", "max (mb)"),
      ChartFormat.DoubleLineBlueRed,
      usedHeapMemory,
      maxHeapMemory
    )
  })
}
