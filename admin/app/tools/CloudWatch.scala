package tools

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.Logging
import conf.Configuration
import conf.Configuration._
import controllers.HealthCheck
import org.joda.time.DateTime
import services.AwsEndpoints
import java.util.concurrent.Future
import scala.collection.JavaConversions._

case class MaximumMetric(metric: Future[GetMetricStatisticsResult]) {
  lazy val max: Double = metric.get().getDatapoints.headOption.map(_.getMaximum.doubleValue()).getOrElse(0.0)
}

object CloudWatch extends implicits.Futures{

  def shutdown() {
    euWestClient.shutdown()
    defaultClient.shutdown()
  }

  val stage = new Dimension().withName("Stage").withValue(environment.stage)
  val stageFilter = new DimensionFilter().withName("Stage").withValue(environment.stage)

  lazy val euWestClient = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.monitoring)
    client
  }

  // some metrics are only available in the 'default' region
  lazy val defaultClient = new AmazonCloudWatchAsyncClient(Configuration.aws.mandatoryCredentials)

  val primaryLoadBalancers: Seq[LoadBalancer] = Seq(
    LoadBalancer("frontend-router"),
    LoadBalancer("frontend-article"),
    LoadBalancer("frontend-facia"),
    LoadBalancer("frontend-applications")
  ).flatten

  val secondaryLoadBalancers = Seq(
    LoadBalancer( "frontend-discussion"),
    LoadBalancer( "frontend-identity"),
    LoadBalancer( "frontend-image"),
    LoadBalancer( "frontend-sport"),
    LoadBalancer( "frontend-commercial"),
    LoadBalancer( "frontend-onward"),
    LoadBalancer( "frontend-r2football"),
    LoadBalancer( "frontend-diagnostics" ),
    LoadBalancer( "frontend-archive" )
  ).flatten

  val loadBalancers = primaryLoadBalancers ++ secondaryLoadBalancers

  private val fastlyMetrics = List(
    ("Fastly Errors (Europe) - errors per minute, average", "errors", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Errors (USA) - errors per minute, average", "errors", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  private val fastlyHitMissMetrics = List(
    ("Fastly Hits and Misses (Europe) - per minute, average", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Hits and Misses (USA) - per minute, average", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  val assetsFiles = Seq(
    "app.js",
    "facia.js",
    "global.css",
    "head.default.css",
    "head.facia.css",
    "head.football.css",
    "head.identity.css"
  )

  def shortStackLatency = latency(primaryLoadBalancers)
  def fullStackLatency = shortStackLatency ++ latency(secondaryLoadBalancers)

  object asyncHandler extends AsyncHandler[GetMetricStatisticsRequest, GetMetricStatisticsResult] with Logging {
    def onError(exception: Exception) {
      log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}")
      exception match {
        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        case e: Exception if e.getMessage.contains("JAXP00010001") => HealthCheck.break()
        case _ =>
      }
    }
    def onSuccess(request: GetMetricStatisticsRequest, result: GetMetricStatisticsResult ) { }
  }

  object listMetricsHandler extends AsyncHandler[ListMetricsRequest, ListMetricsResult] with Logging {
    def onError(exception: Exception) {
      log.info(s"CloudWatch ListMetricsRequest error: ${exception.getMessage}")
    }
    def onSuccess(request: ListMetricsRequest, result: ListMetricsResult ) { }
  }

  // TODO - this file is getting a bit long/ complicated. It needs to be split up a bit

  private def latency(loadBalancers: Seq[LoadBalancer]) = {
    loadBalancers.map{ loadBalancer =>
      new AwsLineChart(loadBalancer.name , Seq("Time", "latency (ms)"), ChartFormat.SingleLineBlack,
        euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(2).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(60)
          .withUnit(StandardUnit.Seconds)
          .withStatistics("Average")
          .withNamespace("AWS/ELB")
          .withMetricName("Latency")
          .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer.id)),
          asyncHandler)
      )
    }.toSeq
  }

  def requestOkShortStack = requestOkCount(primaryLoadBalancers)
  def requestOkFullStack = requestOkShortStack ++ requestOkCount(secondaryLoadBalancers)

  private def requestOkCount(loadBalancers: Seq[LoadBalancer]) = {
    loadBalancers.map{ loadBalancer =>
      new AwsLineChart(loadBalancer.name, Seq("Time", "2xx/minute"), ChartFormat.SingleLineBlue,
        euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(2).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(60)
          .withStatistics("Sum")
          .withNamespace("AWS/ELB")
          .withMetricName("HTTPCode_Backend_2XX")
          .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer.id)),
          asyncHandler)
      )
    }.toSeq
  }

  def fastlyErrors = fastlyMetrics.map{ case (graphTitle, metric, region, service) =>
    new AwsLineChart(graphTitle, Seq("Time", metric), ChartFormat.SingleLineBlack,
      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName(metric)
        .withDimensions(new Dimension().withName("region").withValue(region),
                        new Dimension().withName("service").withValue(service)),
        asyncHandler)
    )
  }.toSeq

  def cost = new MaximumMetric(defaultClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withNamespace("AWS/Billing")
    .withMetricName("EstimatedCharges")
    .withStartTime(new DateTime().toLocalDate.toDate)
    .withEndTime(new DateTime().toDate)
    .withStatistics("Maximum")
    .withPeriod(60 * 60 * 24)
    .withDimensions(new Dimension().withName("Currency").withValue("USD")), asyncHandler))

  def fastlyHitMissStatistics = fastlyHitMissMetrics.map{ case (graphTitle, region, service) =>
    new AwsLineChart( graphTitle, Seq("Time", "Hits", "Misses"), ChartFormat.DoubleLineBlueRed,

      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName("hits")
        .withDimensions(new Dimension().withName("region").withValue(region),
                        new Dimension().withName("service").withValue(service)),
        asyncHandler),

      euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName("miss")
        .withDimensions(new Dimension().withName("region").withValue(region),
                        new Dimension().withName("service").withValue(service)),
        asyncHandler)
    )
  }.toSeq

  def omnitureConfidence = new AwsLineChart("omniture-percent-conversion", Seq("Time", "%"), ChartFormat.SingleLineBlue,
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusWeeks(2).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(900)
    .withStatistics("Average")
    .withNamespace("Analytics")
    .withMetricName("omniture-percent-conversion")
    .withDimensions(stage),
    asyncHandler))

  def ophanConfidence = new AwsLineChart("ophan-percent-conversion", Seq("Time", "%"), ChartFormat.SingleLineBlue,
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("ophan-percent-conversion")
      .withDimensions(stage),
      asyncHandler))

  def ratioConfidence = new AwsLineChart("omniture-ophan-correlation", Seq("Time", "%"), ChartFormat.SingleLineBlue,
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("omniture-ophan-correlation")
      .withDimensions(stage),
      asyncHandler))


  def AbMetricNames() = {
    euWestClient.listMetricsAsync( new ListMetricsRequest()
      .withNamespace("AbTests")
      .withDimensions(stageFilter),
      listMetricsHandler).toScalaFuture
  }
}
