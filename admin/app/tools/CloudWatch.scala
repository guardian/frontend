package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime
import com.amazonaws.handlers.AsyncHandler
import common.Logging
import Configuration._
import java.util.concurrent.Executors

case class LoadBalancer(id: String, name: String, project: String)

object CloudWatch {

  private lazy val executor = Executors.newCachedThreadPool

  def shutdown() {
    executor.shutdownNow()
  }

  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  // we create a new client on each request, otherwise we run into this problem
  // http://blog.bdoughan.com/2011/03/preventing-entity-expansion-attacks-in.html
  def euWestClient = {
    val client = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials, executor)
    client.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    client
  }

  // some metrics are only available in the 'default' region
  def defaultClient = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials, executor)

  val primaryLoadBalancers = Seq(
    LoadBalancer("frontend-RouterLo-1HHMP4C9L33QJ", "Router", "frontend-router"),
    LoadBalancer("frontend-ArticleL-T0BUR121RZIG", "Article", "frontend-article"),
    LoadBalancer("frontend-FaciaLoa-I92TZ7OEAX7W", "Front", "frontend-facia"),
    LoadBalancer("frontend-Applicat-V36EHVHAEI15", "Applications", "frontend-applications")
  )

  val secondaryLoadBalancers = Seq(
    LoadBalancer("frontend-CoreNavi-19L03IVT6RTL5", "CoreNav", "frontend-core-navigation"),
    LoadBalancer("frontend-Discussi-KC65SADEVHIE", "Discussion", "frontend-discussion"),
    LoadBalancer("frontend-Identity-1ITBJ706CLQIC", "Identity", "frontend-identity"),
    LoadBalancer("frontend-ImageLoa-Y3FM3W6ZRJC1", "Image", "frontend-image"),
    LoadBalancer("frontend-SportLoa-GLJK02HUD48W", "Sport", "frontend-sport"),
    LoadBalancer("frontend-Commerci-12ZQ79RIOLIYE", "Commercial", "frontend-commercial"),
    LoadBalancer("frontend-OnwardLo-14YIUHL6HIW63", "Onward", "frontend-onward"),
    LoadBalancer("frontend-R2Footba-9BHU0R3R3DHV", "R2 Football", "frontend-r2football")
  )

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

  def shortStackLatency = latency(primaryLoadBalancers)
  def fullStackLatency = shortStackLatency ++ latency(secondaryLoadBalancers)

  object asyncHandler extends AsyncHandler[GetMetricStatisticsRequest, GetMetricStatisticsResult] with Logging
  {
    def onError(exception: Exception)
    {
      log.info(s"CloudWatch GetMetricStatisticsRequest error: ${exception.getMessage}}")
    }
    def onSuccess(request: GetMetricStatisticsRequest, result: GetMetricStatisticsResult )
    {
    }
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
  
  def adsInView(statistic: String) = new LineChart(statistic, Nil,
    euWestClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(1).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(120)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName(statistic)
      .withDimensions(stage),
      asyncHandler))

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
  
  def liveStats(statistic: String) = new LineChart(statistic, Nil,
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

}
