package tools

import tools.CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import common.ExecutionContexts
import org.joda.time.DateTime
import awswrappers.cloudwatch._

import scala.concurrent.Future

object MemoryMetrics extends ExecutionContexts {
  private def jvmLoadBalancers = loadBalancers.diff(List(LoadBalancer("frontend-router"), LoadBalancer("frontend-image")).flatten)

  def memory: Future[Seq[AwsLineChart]] = withErrorLogging(Future.traverse(jvmLoadBalancers) { loadBalancer =>
    val applicationName: Dimension = new Dimension().withName("ApplicationName").withValue(loadBalancer.project)
    for {
      usedHeapMemory <- euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("Application")
        .withMetricName("used-heap-memory")
        .withDimensions(stage, applicationName))

      maxHeapMemory <- euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(3).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Average")
        .withNamespace("Application")
        .withMetricName("max-heap-memory")
        .withDimensions(stage, applicationName))
    } yield new AwsLineChart(
      s"${loadBalancer.name} JVM memory",
      Seq("Memory", "used (mb)", "max (mb)"),
      ChartFormat.DoubleLineBlueRed,
      usedHeapMemory,
      maxHeapMemory
    )
  })
}
