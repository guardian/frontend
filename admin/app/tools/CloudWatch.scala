package tools

import awswrappers.cloudwatch._
import com.amazonaws.services.cloudwatch.{
  AmazonCloudWatchAsync,
  AmazonCloudWatchAsyncClient,
  AmazonCloudWatchAsyncClientBuilder,
}
import com.amazonaws.services.cloudwatch.model._
import common.GuLogging
import conf.Configuration
import conf.Configuration._

import scala.concurrent.{ExecutionContext, Future}

object CloudWatch extends GuLogging {
  def shutdown(): Unit = {
    euWestClient.shutdown()
    defaultClient.shutdown()
  }

  val stage = new Dimension().withName("Stage").withValue(environment.stage)
  val stageFilter = new DimensionFilter().withName("Stage").withValue(environment.stage)

  lazy val defaultClientBuilder: AmazonCloudWatchAsyncClientBuilder = AmazonCloudWatchAsyncClient
    .asyncBuilder()
    .withCredentials(Configuration.aws.mandatoryCredentials)

  lazy val euWestClient: AmazonCloudWatchAsync = defaultClientBuilder
    .withRegion(conf.Configuration.aws.region)
    .build()

  // some metrics are only available in the 'default' region
  lazy val defaultClient: AmazonCloudWatchAsync = defaultClientBuilder.build()

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

  def AbMetricNames()(implicit executionContext: ExecutionContext): Future[ListMetricsResult] = {
    withErrorLogging(
      euWestClient.listMetricsFuture(
        new ListMetricsRequest()
          .withNamespace("AbTests")
          .withDimensions(stageFilter),
      ),
    )
  }
}
