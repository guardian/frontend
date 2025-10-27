package tools

import common.GuLogging
import conf.Configuration._
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.cloudwatch.{CloudWatchAsyncClient, CloudWatchAsyncClientBuilder}
import software.amazon.awssdk.services.cloudwatch.model.{
  Dimension,
  DimensionFilter,
  ListMetricsRequest,
  ListMetricsResponse,
}
import utils.AWSv2
import scala.jdk.FutureConverters._

import scala.concurrent.{ExecutionContext, Future}

object CloudWatch extends GuLogging {

  val stage = Dimension.builder().name("Stage").value(environment.stage).build()
  val stageFilter = DimensionFilter.builder().name("Stage").value(environment.stage).build()

  lazy val defaultClientBuilder: CloudWatchAsyncClientBuilder =
    CloudWatchAsyncClient.builder().credentialsProvider(AWSv2.credentials)

  lazy val euWestClient: CloudWatchAsyncClient = defaultClientBuilder
    .region(Region.of(conf.Configuration.aws.region))
    .build()

  // some metrics are only available in the 'default' region
  lazy val defaultClient: CloudWatchAsyncClient = defaultClientBuilder.build()

  val v1LoadBalancerNamespace = "AWS/ELB"
  val v2LoadBalancerNamespace = "AWS/ApplicationELB"

  val primaryLoadBalancers: Seq[LoadBalancer] = Seq(
    LoadBalancer("frontend-router"),
    LoadBalancer("frontend-article"),
    LoadBalancer("frontend-facia"),
    LoadBalancer("frontend-applications"),
  ).flatten

  val secondaryLoadBalancers = Seq(
    LoadBalancer("frontend-discussion"),
    LoadBalancer("frontend-identity"),
    LoadBalancer("frontend-sport"),
    LoadBalancer("frontend-commercial"),
    LoadBalancer("frontend-onward"),
    LoadBalancer("frontend-diagnostics"),
    LoadBalancer("frontend-archive"),
    LoadBalancer("frontend-rss"),
  ).flatten

  val loadBalancers = primaryLoadBalancers ++ secondaryLoadBalancers

  def withErrorLogging[A](future: Future[A])(implicit executionContext: ExecutionContext): Future[A] = {
    future.failed.foreach { exception: Throwable =>
      log.error(s"CloudWatch error: ${exception.getMessage}", exception)
    }
    future
  }

  def AbMetricNames()(implicit executionContext: ExecutionContext): Future[ListMetricsResponse] = {
    withErrorLogging(
      euWestClient
        .listMetrics(
          ListMetricsRequest
            .builder()
            .namespace("AbTests")
            .dimensions(stageFilter)
            .build(),
        )
        .asScala,
    )
  }
}
