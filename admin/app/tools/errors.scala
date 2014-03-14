package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime

object HttpErrors {

  def global4XX = new LineChart("Global 4XX", Seq("Time", "4xx/min"), euWestClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_4XX")
    ,asyncHandler)
  )

  private val prod =  new Dimension().withName("Stage").withValue("prod")

  def googlebot404s = Seq(
    new LineChart("12 hours", Seq("Time", "404/min"), euWestClient.getMetricStatisticsAsync(
      metric("googlebot-404s").withStartTime(new DateTime().minusHours(12).toDate)
        .withNamespace("ArchiveMetrics").withDimensions(prod),
      asyncHandler)
    ),
    new LineChart("2 weeks", Seq("Time", "404/15min"), euWestClient.getMetricStatisticsAsync(
      metric("googlebot-404s").withNamespace("ArchiveMetrics")
        .withDimensions(prod).withPeriod(900)
        .withStartTime(new DateTime().minusDays(14).toDate),
      asyncHandler)
    )
  )

  def global5XX = new LineChart("Global 5XX", Seq("Time", "5XX/ min"), euWestClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_5XX")
    ,asyncHandler)
  )

  def notFound = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ loadBalancer =>
    new LineChart(loadBalancer.name, Seq("Time", "4XX/ min"), euWestClient.getMetricStatisticsAsync(
      metric("HTTPCode_Backend_4XX", Some(loadBalancer.id))
    ))
  }

  def errors = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ loadBalancer =>
    new LineChart(loadBalancer.name, Seq("Time", "5XX/ min"), euWestClient.getMetricStatisticsAsync(
      metric("HTTPCode_Backend_5XX", Some(loadBalancer.id))
    ))
  }

  def metric(metricName: String, loadBalancer: Option[String] = None) = {
    val metric = new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Sum")
      .withNamespace("AWS/ELB")
      .withMetricName(metricName)

    loadBalancer.map(lb => metric.withDimensions(new Dimension().withName("LoadBalancerName").withValue(lb)))
    .getOrElse(metric)
  }
}