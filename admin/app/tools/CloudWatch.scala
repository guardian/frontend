package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime
import com.amazonaws.handlers.AsyncHandler
import common.Logging


trait CloudWatch {

  val loadBalancers = Map(
    "frontend-RouterLo-1HHMP4C9L33QJ" -> "Router",
    "frontend-ArticleL-T0BUR121RZIG" -> "Article",
    "frontend-FrontLoa-L86HJF9PG40T" -> "Front",
    "frontend-Applicat-V36EHVHAEI15" -> "Applications"
  )

  private val fastlyMetrics = List(
    ("Fastly Errors (Europe)", "errors", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly 5xx (Europe)", "status_5xx", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Hits (Europe)", "hits", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Misses (Europe)", "miss", "europe", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Errors (USA)", "errors", "usa", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly 5xx (USA)", "status_5xx", "usa", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Hits (USA)", "hits", "usa", "2eYr6Wx3ZCUoVPShlCM61l"),
    ("Fastly Misses (USA)", "miss", "usa", "2eYr6Wx3ZCUoVPShlCM61l")
  )

  lazy val cloudClient = {
    val c = new AmazonCloudWatchAsyncClient(Configuration.aws.credentials)
    c.setEndpoint("monitoring.eu-west-1.amazonaws.com")
    c
  }

  def latency = loadBalancers.map{ case (loadBalancer, name) =>
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

  def requestOkCount = loadBalancers.map{ case (loadBalancer, name) =>
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
