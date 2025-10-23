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
import org.joda.time.DateTime

import scala.jdk.CollectionConverters._
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

  private val chartColours = Map(
    ("frontend-router", ChartFormat(Colour.`tone-news-1`)),
    ("frontend-article", ChartFormat(Colour.`tone-news-1`)),
    ("frontend-facia", ChartFormat(Colour.`tone-news-1`)),
    ("frontend-applications", ChartFormat(Colour.`tone-news-1`)),
    ("frontend-discussion", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-identity", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-sport", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-commercial", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-onward", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-r2football", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-diagnostics", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-archive", ChartFormat(Colour.`tone-news-2`)),
    ("frontend-rss", ChartFormat(Colour.`tone-news-2`)),
  ).withDefaultValue(ChartFormat.SingleLineBlack)

  val loadBalancers = primaryLoadBalancers ++ secondaryLoadBalancers

  def withErrorLogging[A](future: Future[A])(implicit executionContext: ExecutionContext): Future[A] = {
    future.failed.foreach { exception: Throwable =>
      log.error(s"CloudWatch error: ${exception.getMessage}", exception)
    }
    future
  }

  def prepareV1LoadBalancerRequest(
      baseRequest: GetMetricStatisticsRequest,
      loadBalancerId: String,
      v1MetricName: String,
  ): GetMetricStatisticsRequest = baseRequest
    .withNamespace(v1LoadBalancerNamespace)
    .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancerId))
    .withMetricName(v1MetricName)

  def prepareV2LoadBalancerRequest(
      baseRequest: GetMetricStatisticsRequest,
      loadBalancerId: String,
      v2MetricName: String,
      // Most metrics that we're interested in don't need this dimension
      targetGroupDimensionValue: Option[String] = None,
  ): GetMetricStatisticsRequest = {
    val loadBalancerDimension = new Dimension().withName("LoadBalancer").withValue(loadBalancerId)
    val dimensions: List[Dimension] = targetGroupDimensionValue
      .map(targetGroup => List(loadBalancerDimension, new Dimension().withName("TargetGroup").withValue(targetGroup)))
      .getOrElse(List(loadBalancerDimension))
    baseRequest
      .withNamespace(v2LoadBalancerNamespace)
      .withDimensions(dimensions.asJava)
      .withMetricName(v2MetricName)
  }

  def fetchLatencyMetric(
      loadBalancer: LoadBalancer,
  )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] = {
    val baseRequest = new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withUnit(StandardUnit.Seconds)
      .withStatistics("Average")
    val fullRequest = loadBalancer.targetGroup match {
      case None =>
        prepareV1LoadBalancerRequest(baseRequest, loadBalancer.id, "Latency")
      case Some(_) =>
        prepareV2LoadBalancerRequest(baseRequest, loadBalancer.id, "TargetResponseTime")
    }
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(fullRequest),
    )
  }

  def fetchOkMetric(
      loadBalancer: LoadBalancer,
  )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] = {
    val baseRequest = new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Sum")
    val fullRequest = loadBalancer.targetGroup match {
      case None =>
        prepareV1LoadBalancerRequest(baseRequest, loadBalancer.id, "HTTPCode_Backend_2XX")
      case Some(_) =>
        prepareV2LoadBalancerRequest(baseRequest, loadBalancer.id, "HTTPCode_Target_2XX_Count")
    }
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(fullRequest),
    )
  }

  def dualOkLatency(
      loadBalancers: Seq[LoadBalancer],
  )(implicit executionContext: ExecutionContext): Future[Seq[AwsDualYLineChart]] = {
    Future.traverse(loadBalancers) { loadBalancer =>
      for {
        oks <- fetchOkMetric(loadBalancer)
        latency <- fetchLatencyMetric(loadBalancer)
        healthyHosts <- fetchHealthyHostMetric(loadBalancer)
      } yield {
        val chartTitle = s"${loadBalancer.name} - ${healthyHosts.getDatapoints.asScala.last.getMaximum.toInt} instances"
        new AwsDualYLineChart(
          chartTitle,
          ("Time", "2xx/minute", "latency (secs)"),
          ChartFormat(Colour.`tone-news-1`, Colour.`tone-comment-1`),
          oks,
          latency,
        )
      }
    }
  }

  def dualOkLatencyFullStack()(implicit executionContext: ExecutionContext): Future[Seq[AwsDualYLineChart]] =
    dualOkLatency(primaryLoadBalancers ++ secondaryLoadBalancers)

  def fetchHealthyHostMetric(
      loadBalancer: LoadBalancer,
  )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] = {
    val baseRequest = new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Maximum")
    val fullRequest = loadBalancer.targetGroup match {
      case None =>
        prepareV1LoadBalancerRequest(baseRequest, loadBalancer.id, "HealthyHostCount")
      case Some(targetGroup) =>
        prepareV2LoadBalancerRequest(
          baseRequest,
          loadBalancer.id,
          "HealthyHostCount",
          targetGroupDimensionValue = Some(targetGroup),
        )
    }
    withErrorLogging(
      euWestClient.getMetricStatisticsFuture(fullRequest),
    )
  }

  def confidenceGraph(metricName: String)(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    for {
      percentConversion <- withErrorLogging(
        euWestClient.getMetricStatisticsFuture(
          new GetMetricStatisticsRequest()
            .withStartTime(new DateTime().minusWeeks(2).toDate)
            .withEndTime(new DateTime().toDate)
            .withPeriod(900)
            .withStatistics("Average")
            .withNamespace("Analytics")
            .withMetricName(metricName)
            .withDimensions(stage),
        ),
      )
    } yield new AwsLineChart(metricName, Seq("Time", "%"), ChartFormat.SingleLineBlue, percentConversion)

  def ophanConfidence()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    confidenceGraph("ophan-percent-conversion")

  def googleConfidence()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
    confidenceGraph("google-percent-conversion")

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
