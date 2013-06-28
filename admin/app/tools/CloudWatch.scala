package tools

import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import conf.Configuration
import com.amazonaws.services.cloudwatch.model._
import org.joda.time.DateTime


trait CloudWatch {

  val loadBalancers = Map(
    "frontend-RouterLo-1HHMP4C9L33QJ" -> "Router",
    "frontend-ArticleL-T0BUR121RZIG" -> "Article",
    "frontend-FrontLoa-L86HJF9PG40T" -> "Front",
    "frontend-Applicat-V36EHVHAEI15" -> "Applications"
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
      .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer)))
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
        .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer)))
    )
  }.toSeq
}

object CloudWatch extends CloudWatch
