package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime


object HttpErrors {

  def global4XX = new LineChart("Global 4XX", Seq("Time", "4xx/min"), cloudClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_4XX")
    ,asyncHandler)
  )

  def global5XX = new LineChart("Global 5XX", Seq("Time", "5XX/ min"), cloudClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_5XX")
    ,asyncHandler)
  )

  def notFound = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ loadBalancer =>
    new LineChart(loadBalancer.name, Seq("Time", "4XX/ min"), cloudClient.getMetricStatisticsAsync(
      metric("HTTPCode_Backend_4XX", Some(loadBalancer.id))
    ))
  }

  def errors = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ loadBalancer =>
    new LineChart(loadBalancer.name, Seq("Time", "5XX/ min"), cloudClient.getMetricStatisticsAsync(
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