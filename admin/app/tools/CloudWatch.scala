package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime
import com.amazonaws.handlers.AsyncHandler
import common.Logging

trait CloudWatch {

  val primaryLoadBalancers = Map(
    ("frontend-RouterLo-1HHMP4C9L33QJ", "Router"),
    ("frontend-ArticleL-T0BUR121RZIG", "Article"),
    ("frontend-FaciaLoa-I92TZ7OEAX7W", "Front"),
    ("frontend-Applicat-V36EHVHAEI15", "Applications")
  )

  val secondaryLoadBalancers = Map(
    ("frontend-CoreNavi-19L03IVT6RTL5", "CoreNav"),
    ("frontend-Discussi-KC65SADEVHIE", "Discussion"),
    ("frontend-Identity-1ITBJ706CLQIC", "Identity"),
    ("frontend-ImageLoa-Y3FM3W6ZRJC1", "Image"),
    ("frontend-SportLoa-GLJK02HUD48W", "Sport"),
    ("frontend-Commerci-12ZQ79RIOLIYE", "Commercial")
  )

  private val fastlyMetrics = List(
    ("Fastly Errors (Europe) - errors per minute, average", "errors", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Errors (USA) - errors per minute, average", "errors", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  private val fastlyHitMissMetrics = List(
    ("Fastly Hits and Misses (Europe) - per minute, average", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Hits and Misses (USA) - per minute, average", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  lazy val cloudClient = {
    val c = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    c.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    c
  }

  def latencyShortStack = latency(primaryLoadBalancers)
  def latencyFullStack = latencyShortStack ++ latency(secondaryLoadBalancers)

  private def latency(loadBalancers: Map[String,String]): Seq[LatencyGraph] = {
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

  private def requestOkCount(loadBalancers: Map[String,String]): Seq[Request2xxGraph] = {
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
}

object CloudWatch extends CloudWatch
