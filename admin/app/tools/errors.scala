package tools

import CloudWatch._
import com.amazonaws.services.cloudwatch.model.{Dimension, GetMetricStatisticsRequest}
import org.joda.time.DateTime
import awswrappers.cloudwatch._
import conf.Configuration._

import scala.concurrent.{ExecutionContext, Future}

object HttpErrors {
  def global4XX()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    euWestClient.getMetricStatisticsFuture(metric("HTTPCode_Backend_4XX")) map { metric =>
      new AwsLineChart("Global 4XX", Seq("Time", "4xx/min"), ChartFormat.SingleLineBlue, metric)
    }

  private val stage = new Dimension().withName("Stage").withValue(environment.stage)

  def googlebot404s()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(
      Future.sequence(
        Seq(
          euWestClient.getMetricStatisticsFuture(
            metric("googlebot-404s")
              .withStartTime(new DateTime().minusHours(12).toDate)
              .withNamespace("ArchiveMetrics")
              .withDimensions(stage),
          ) map { metric =>
            new AwsLineChart("12 hours", Seq("Time", "404/min"), ChartFormat(Colour.`tone-live-1`), metric)
          },
          euWestClient.getMetricStatisticsFuture(
            metric("googlebot-404s")
              .withNamespace("ArchiveMetrics")
              .withDimensions(stage)
              .withPeriod(900)
              .withStartTime(new DateTime().minusDays(14).toDate),
          ) map { metric =>
            new AwsLineChart("2 weeks", Seq("Time", "404/15min"), ChartFormat(Colour.`tone-live-2`), metric)
          },
        ),
      ),
    )

  def global5XX()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(
        metric("HTTPCode_Backend_5XX"),
      ) map { metric =>
        new AwsLineChart("Global 5XX", Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      },
    )

  def notFound()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatisticsFuture(
        metric("HTTPCode_Backend_4XX", Some(loadBalancer.id)),
      ) map { metric =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "4XX/ min"), ChartFormat.SingleLineBlue, metric)
      }
    })

  def errors()(implicit executionContext: ExecutionContext): Future[Seq[AwsLineChart]] =
    withErrorLogging(Future.traverse(primaryLoadBalancers ++ secondaryLoadBalancers) { loadBalancer =>
      euWestClient.getMetricStatisticsFuture(
        metric("HTTPCode_Backend_5XX", Some(loadBalancer.id)),
      ) map { metric =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "5XX/ min"), ChartFormat.SingleLineRed, metric)
      }
    })

  def metric(metricName: String, loadBalancer: Option[String] = None)(implicit
      executionContext: ExecutionContext,
  ): GetMetricStatisticsRequest = {
    val metric = new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Sum")
      .withNamespace("AWS/ELB")
      .withMetricName(metricName)

    loadBalancer
      .map(lb => metric.withDimensions(new Dimension().withName("LoadBalancerName").withValue(lb)))
      .getOrElse(metric)
  }
}
