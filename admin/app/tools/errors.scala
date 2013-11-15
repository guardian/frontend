package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{GetMetricStatisticsResult, Dimension, StandardUnit, GetMetricStatisticsRequest}
import org.joda.time.DateTime
import java.util.concurrent.Future
import scala.collection.JavaConversions._

class RequestCountGraph(val name: String, _yAxis: String, private val metrics: Future[GetMetricStatisticsResult]) extends Chart {

  lazy val labels = Seq("Time", "count")

  override lazy val yAxis = Some(_yAxis)
  private lazy val datapoints = metrics.get().getDatapoints.sortBy(_.getTimestamp.getTime).toSeq

  lazy val dataset = datapoints.map{d =>
    DataPoint(
      new DateTime(d.getTimestamp.getTime).toString("HH:mm"),
      Seq(d.getSum)
    )
  }

  lazy val hasData = datapoints.nonEmpty
}


object HttpErrors {

  def global4XX = new RequestCountGraph("Global 4XX", "4XX/ min", cloudClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_4XX")
    ,asyncHandler)
  )

  def global5XX = new RequestCountGraph("Global 5XX", "5XX/ min", cloudClient.getMetricStatisticsAsync(
    metric("HTTPCode_Backend_5XX")
    ,asyncHandler)
  )

  def notFound = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ case (loadBalancer, name) =>
    new RequestCountGraph(name, "4XX/ min", cloudClient.getMetricStatisticsAsync(
      metric("HTTPCode_Backend_4XX", Some(loadBalancer))
    ))
  }

  def errors = (primaryLoadBalancers ++ secondaryLoadBalancers).map{ case (loadBalancer, name) =>
    new RequestCountGraph(name, "5XX/ min", cloudClient.getMetricStatisticsAsync(
      metric("HTTPCode_Backend_5XX", Some(loadBalancer))
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