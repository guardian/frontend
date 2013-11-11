package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime
import com.amazonaws.handlers.AsyncHandler
import common.Logging
import Configuration._

object CloudWatch {

  val stage = new Dimension().withName("Stage").withValue(environment.stage)

  lazy val cloudClient = {
    val c = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    c.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    c
  }

  val primaryLoadBalancers = Seq(
    ("frontend-RouterLo-1HHMP4C9L33QJ", "Router"),
    ("frontend-ArticleL-T0BUR121RZIG", "Article"),
    ("frontend-FaciaLoa-I92TZ7OEAX7W", "Front"),
    ("frontend-Applicat-V36EHVHAEI15", "Applications")
  )

  val secondaryLoadBalancers = Seq(
    ("frontend-CoreNavi-19L03IVT6RTL5", "CoreNav"),
    ("frontend-Discussi-KC65SADEVHIE", "Discussion"),
    ("frontend-Identity-1ITBJ706CLQIC", "Identity"),
    ("frontend-ImageLoa-Y3FM3W6ZRJC1", "Image"),
    ("frontend-SportLoa-GLJK02HUD48W", "Sport"),
    ("frontend-Commerci-12ZQ79RIOLIYE", "Commercial"),
    ("frontend-OnwardLo-14YIUHL6HIW63", "Onward"),
    ("frontend-R2Footba-9BHU0R3R3DHV", "R2 Football")
  )

  private val fastlyMetrics = List(
    ("Fastly Errors (Europe) - errors per minute, average", "errors", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Errors (USA) - errors per minute, average", "errors", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  private val fastlyHitMissMetrics = List(
    ("Fastly Hits and Misses (Europe) - per minute, average", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Hits and Misses (USA) - per minute, average", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )


  def shortStack = latency(primaryLoadBalancers)
  def fullStack = shortStack ++ latency(secondaryLoadBalancers)

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

  def shutdown() {
    cloudClient.shutdown()
    defaultCloudClient.shutdown()
  }


  // TODO - this file is getting a bit long/ complicated. It needs to be split up a bit



  private def latency(loadBalancers: Seq[(String,String)]): Seq[LatencyGraph] = {
    loadBalancers.map{ case (loadBalancer, name) =>
      new LatencyGraph(name ,
        cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(2).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(60)
          .withUnit(StandardUnit.Seconds)
          .withStatistics("Average")
          .withNamespace("AWS/ELB")
          .withMetricName("Latency")
          .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer)),
          asyncHandler)
      )
    }.toSeq
  }

  def requestOkShortStack = requestOkCount(primaryLoadBalancers)
  def requestOkFullStack = requestOkShortStack ++ requestOkCount(secondaryLoadBalancers)

  private def requestOkCount(loadBalancers: Seq[(String,String)]): Seq[Request2xxGraph] = {
    loadBalancers.map{ case (loadBalancer, name) =>
      new Request2xxGraph(name,
        cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(2).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(60)
          .withStatistics("Sum")
          .withNamespace("AWS/ELB")
          .withMetricName("HTTPCode_Backend_2XX")
          .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer)),
          asyncHandler)
      )
    }.toSeq
  }

  def fastlyStatistics = fastlyMetrics.map{ case (graphTitle, metric, region, service) =>
    new FastlyMetricGraph( graphTitle, metric,
      cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
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
  
  def liveStats(statistic: String) = new LiveStatsGraph(
    cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(6).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(120)
      .withStatistics("Average")
      .withNamespace("Diagnostics")
      .withMetricName(statistic)
      .withDimensions(stage),
      asyncHandler))


  // charges are only available from the 'default' region
  private lazy val defaultCloudClient = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
  def cost = new CostMetric(defaultCloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
    .withNamespace("AWS/Billing")
    .withMetricName("EstimatedCharges")
    .withStartTime(new DateTime().toLocalDate.toDate)
    .withEndTime(new DateTime().toDate)
    .withStatistics("Maximum")
    .withPeriod(60 * 60 * 24)
    .withDimensions(new Dimension().withName("Currency").withValue("USD")), asyncHandler))

  def fastlyHitMissStatistics = fastlyHitMissMetrics.map{ case (graphTitle, region, service) =>
    new FastlyHitMissGraph( graphTitle,

      cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName("hits")
        .withDimensions(new Dimension().withName("region").withValue(region),
                        new Dimension().withName("service").withValue(service)),
        asyncHandler),

      cloudClient.getMetricStatisticsAsync(new GetMetricStatisticsRequest()
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
