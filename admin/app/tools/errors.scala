package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime
import awswrappers.cloudwatch._
import conf.Configuration._

import scala.concurrent.{ExecutionContext, Future}

object HttpErrors {

  private val stage = new Dimension().withName("Stage").withValue(environment.stage)

  def googlebot404s()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(
      Future.sequence(
        Seq(
          euWestClient.getMetricStatisticsFuture(
            metric("googlebot-404s", "ArchiveMetrics")
              .withStartTime(new DateTime().minusHours(12).toDate)
              .withDimensions(stage),
          ) map { metric =>
            new AwsLineChart("12 hours", Seq("Time", "404/min"), ChartFormat(Colour.`tone-live-1`), metric)
          },
          euWestClient.getMetricStatisticsFuture(
            metric("googlebot-404s", "ArchiveMetrics")
              .withDimensions(stage)
              .withPeriod(900)
              .withStartTime(new DateTime().minusDays(14).toDate),
          ) map { metric =>
            new AwsLineChart("2 weeks", Seq("Time", "404/15min"), ChartFormat(Colour.`tone-live-2`), metric)
          },
        ),
      ),
    )

  val v1LoadBalancerNamespace = "AWS/ELB"
  val v2LoadBalancerNamespace = "AWS/ApplicationELB"

  val v1Metric4XX = "HTTPCode_Backend_4XX"
  val v2Metric4XX = "HTTPCode_Target_4XX_Count"

  val v1Metric5XX = "HTTPCode_Backend_5XX"
  val v2Metric5XX = "HTTPCode_Target_5XX_Count"

  def global4XX()(implicit executionContext: ExecutionContext): Future[AwsLineChart] = for {
    v1Metric <- withErrorLogging(euWestClient.getMetricStatisticsFuture(metric(v1Metric4XX, v1LoadBalancerNamespace)))
    v2Metric <- withErrorLogging(
      euWestClient.getMetricStatisticsFuture(
        loadBalancerMetric(v1Metric4XX, v2Metric4XX, LoadBalancer("frontend-discussion").get),
      ),
    )
  } yield {
    new AwsLineChart(
      "Global 4XX",
      Seq("Time", "4XX/ min"),
      ChartFormat.SingleLineRed,
      v1Metric,
      v2Metric,
    )
  }

  def global5XX()(implicit executionContext: ExecutionContext): Future[AwsLineChart] = for {
    v1Metric <- withErrorLogging(euWestClient.getMetricStatisticsFuture(metric(v1Metric5XX, v1LoadBalancerNamespace)))
    v2Metric <- withErrorLogging(
      euWestClient.getMetricStatisticsFuture(
        loadBalancerMetric(v1Metric5XX, v2Metric5XX, LoadBalancer("frontend-discussion").get),
      ),
    )
  } yield {
    new AwsLineChart(
      "Global 5XX",
      Seq("Time", "5XX/ min"),
      ChartFormat.DoubleLineBlueRed,
      v1Metric,
      v2Metric,
    )
  }

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
      case None    => metric(v1MetricName, v1LoadBalancerNamespace)
      case Some(_) => metric(v2MetricName, v2LoadBalancerNamespace)
    }
  }

}
