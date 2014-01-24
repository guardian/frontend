package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.{AdminHealthCheckPage, Configuration}
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime
import com.amazonaws.handlers.AsyncHandler
import common.Logging
import Configuration._

object CloudWatch extends implicits.Futures{

  def shutdown() {
    euWestClient.shutdown()
    defaultClient.shutdown()
  }

  val stage = new Dimension().withName("Stage").withValue(environment.stage)
  val stageFilter = new DimensionFilter().withName("Stage").withValue(environment.stage)

  lazy val euWestClient = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    client.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    client
  }

  // some metrics are only available in the 'default' region
  lazy val defaultClient = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)

  val primaryLoadBalancers: Seq[LoadBalancer] = Seq(
    LoadBalancer("frontend-router"),
    LoadBalancer("frontend-article"),
    LoadBalancer("frontend-facia"),
    LoadBalancer("frontend-applications")
  ).flatten

  val secondaryLoadBalancers = Seq(
    LoadBalancer( "frontend-core-navigation"),
    LoadBalancer( "frontend-discussion"),
    LoadBalancer( "frontend-identity"),
    LoadBalancer( "frontend-image"),
    LoadBalancer( "frontend-sport"),
    LoadBalancer( "frontend-commercial"),
    LoadBalancer( "frontend-onward"),
    LoadBalancer( "frontend-r2football"),
    LoadBalancer( "frontend-diagnostics" )
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

  private val jsErrorMetrics = List(
    ("JavaScript errors caused by adverts", "ads"),
    ("JavaScript errors from iOS", "js.ios"),
    ("JavaScript errors from iOS", "js.android"),
    ("JavaScript errors from iOS", "js.unknown"),
    ("JavaScript errors from iOS", "js.windows")
  )

  val assetsFiles = Seq(
    "app.js",
    "global.css",
    "head.default.css",
    "head.facia.css"
  )

  def shortStackLatency = latency(primaryLoadBalancers)
  def fullStackLatency = shortStackLatency ++ latency(secondaryLoadBalancers)

  object asyncHandler extends AsyncHandler[GetMetricStatisticsRequest, GetMetricStatisticsResult] with Logging {
    def onError(exception: Exception) {
      log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}")
      exception match {
        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        case e: Exception if e.getMessage.contains("JAXP00010001") => AdminHealthCheckPage.setUnhealthy()
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
      new LineChart(loadBalancer.name , Seq("Time", "latency (ms)"),
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
      new LineChart(loadBalancer.name, Seq("Time", "2xx/minute"),
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
  
  def jsErrors = { 
    val metrics = jsErrorMetrics.map{ case (graphTitle, metric) =>
        euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(6).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(120)
          .withStatistics("Average")
          .withNamespace("Diagnostics")
          .withMetricName(metric)
          .withDimensions(stage),
          asyncHandler)
        }
    new LineChart("JavaScript Errors", Seq("Time") ++ jsErrorMetrics.map{ case(title, name) => name}.toSeq, metrics:_*)
  }
  
  def fastlyErrors = fastlyMetrics.map{ case (graphTitle, metric, region, service) =>
    new LineChart(graphTitle, Seq("Time", metric),
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
  
  def liveStats(statistic: String) = new LineChart(statistic, Seq("Time", statistic),
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(6).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(120)
      .withStatistics("Average")
      .withNamespace("Diagnostics")
      .withMetricName(statistic)
      .withDimensions(stage),
      asyncHandler))

  def cost = new MaximumMetric(defaultClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withNamespace("AWS/Billing")
    .withMetricName("EstimatedCharges")
    .withStartTime(new DateTime().toLocalDate.toDate)
    .withEndTime(new DateTime().toDate)
    .withStatistics("Maximum")
    .withPeriod(60 * 60 * 24)
    .withDimensions(new Dimension().withName("Currency").withValue("USD")), asyncHandler))

  def fastlyHitMissStatistics = fastlyHitMissMetrics.map{ case (graphTitle, region, service) =>
    new LineChart( graphTitle, Seq("Time", "Hits", "Misses"),

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

  def omnitureConfidence = new LineChart("omniture-percent-conversion", Seq("Time", "%"),
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withStartTime(new DateTime().minusWeeks(2).toDate)
    .withEndTime(new DateTime().toDate)
    .withPeriod(900)
    .withStatistics("Average")
    .withNamespace("Analytics")
    .withMetricName("omniture-percent-conversion")
    .withDimensions(stage),
    asyncHandler))

  def ophanConfidence = new LineChart("ophan-percent-conversion", Seq("Time", "%"),
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("ophan-percent-conversion")
      .withDimensions(stage),
      asyncHandler))

  def ratioConfidence = new LineChart("omniture-ophan-correlation", Seq("Time", "%"),
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
