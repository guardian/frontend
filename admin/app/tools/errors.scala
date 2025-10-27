package tools

import CloudWatch._
import org.joda.time.DateTime
import software.amazon.awssdk.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest, Statistic}

import scala.concurrent.{ExecutionContext, Future}
import scala.jdk.FutureConverters._

object HttpErrors {

  val v1Metric4XX = "HTTPCode_Backend_4XX"
  val v2Metric4XX = "HTTPCode_Target_4XX_Count"

  val v1Metric5XX = "HTTPCode_Backend_5XX"
  val v2Metric5XX = "HTTPCode_Target_5XX_Count"

  def legacyElb4XXs()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    withErrorLogging(
      euWestClient.getMetricStatistics(metric(v1Metric4XX, v1LoadBalancerNamespace)).asScala,
    ) map { metric =>
      new AwsLineChart("Legacy ELB 4XXs", Seq("Time", "4xx/min"), ChartFormat.SingleLineBlue, metric)
    }

  def legacyElb5XXs()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    withErrorLogging(
      euWestClient.getMetricStatistics(metric(v1Metric5XX, v1LoadBalancerNamespace)).asScala map { metric =>
        new AwsLineChart("Legacy ELB 5XXs", Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      },
    )

  def notFound()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatistics(loadBalancerMetric(v1Metric4XX, v2Metric4XX, loadBalancer)).asScala map {
        metric =>
          new AwsLineChart(loadBalancer.name, Seq("Time", "4XX/ min"), ChartFormat.SingleLineBlue, metric)
      }
    })

  def errors()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatistics(loadBalancerMetric(v1Metric5XX, v2Metric5XX, loadBalancer)).asScala map {
        metric =>
          new AwsLineChart(loadBalancer.name, Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      }
    })

  def metric(metricName: String, namespace: String): GetMetricStatisticsRequest =
    GetMetricStatisticsRequest
      .builder()
      .startTime(new DateTime().minusHours(2).toDate.toInstant)
      .endTime(new DateTime().toDate.toInstant)
      .period(60)
      .statistics(Statistic.SUM)
      .namespace(namespace)
      .metricName(metricName)
      .build()

  def loadBalancerMetric(
      v1MetricName: String,
      v2MetricName: String,
      loadBalancer: LoadBalancer,
  ): GetMetricStatisticsRequest = {
    loadBalancer.targetGroup match {
      case None =>
        metric(v1MetricName, v1LoadBalancerNamespace).toBuilder
          .dimensions(
            Dimension.builder().name("LoadBalancerName").value(loadBalancer.id).build(),
          )
          .build()
      case Some(_) =>
        metric(v2MetricName, v2LoadBalancerNamespace).toBuilder
          .dimensions(
            Dimension.builder().name("LoadBalancer").value(loadBalancer.id).build(),
          )
          .build()
    }
  }

}
