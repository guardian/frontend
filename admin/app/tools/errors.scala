package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime
import awswrappers.cloudwatch._
import conf.Configuration._

import scala.concurrent.{ExecutionContext, Future}

object HttpErrors {

  private val stage = new Dimension().withName("Stage").withValue(environment.stage)

  val v1Metric4XX = "HTTPCode_Backend_4XX"
  val v2Metric4XX = "HTTPCode_Target_4XX_Count"

  val v1Metric5XX = "HTTPCode_Backend_5XX"
  val v2Metric5XX = "HTTPCode_Target_5XX_Count"

  def legacyElb4XXs()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(metric(v1Metric4XX, v1LoadBalancerNamespace)),
    ) map { metric =>
      new AwsLineChart("Legacy ELB 4XXs", Seq("Time", "4xx/min"), ChartFormat.SingleLineBlue, metric)
    }

  def legacyElb5XXs()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(
        metric(v1Metric5XX, v1LoadBalancerNamespace),
      ) map { metric =>
        new AwsLineChart("Legacy ELB 5XXs", Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      },
    )

  def notFound()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatisticsFuture(
        loadBalancerMetric(v1Metric4XX, v2Metric4XX, loadBalancer),
      ) map { metric =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "4XX/ min"), ChartFormat.SingleLineBlue, metric)
      }
    })

  def errors()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatisticsFuture(
        loadBalancerMetric(v1Metric5XX, v2Metric5XX, loadBalancer),
      ) map { metric =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      }
    })

  def metric(metricName: String, namespace: String): GetMetricStatisticsRequest = new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusHours(2).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(60)
    .withStatistics("Sum")
    .withNamespace(namespace)
    .withMetricName(metricName)

  def loadBalancerMetric(
      v1MetricName: String,
      v2MetricName: String,
      loadBalancer: LoadBalancer,
  ): GetMetricStatisticsRequest = {
    loadBalancer.targetGroup match {
      case None =>
        metric(v1MetricName, v1LoadBalancerNamespace).withDimensions(
          new Dimension().withName("LoadBalancerName").withValue(loadBalancer.id),
        )
      case Some(_) =>
        metric(v2MetricName, v2LoadBalancerNamespace).withDimensions(
          new Dimension().withName("LoadBalancer").withValue(loadBalancer.id),
        )
    }
  }

}
