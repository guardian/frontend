package tools

import awswrappers.cloudwatch._
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsyncClient
import com.amazonaws.services.cloudwatch.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import conf.Configuration._
import controllers.HealthCheck
import org.joda.time.DateTime
import services.AwsEndpoints

import scala.collection.JavaConversions._
import scala.concurrent.Future

case class MaximumMetric(metric: GetMetricStatisticsResult) {
  lazy val max: Double = metric.getDatapoints.headOption.map(_.getMaximum.doubleValue()).getOrElse(0.0)
}

object CloudWatch extends Logging with ExecutionContexts {
  def shutdown(): Unit = {
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
    LoadBalancer("frontend-discussion"),
    LoadBalancer("frontend-identity"),
    LoadBalancer("frontend-image"),
    LoadBalancer("frontend-sport"),
    LoadBalancer("frontend-commercial"),
    LoadBalancer("frontend-onward"),
    LoadBalancer("frontend-diagnostics"),
    LoadBalancer("frontend-archive"),
    LoadBalancer("frontend-rss")
  ).flatten

  private val chartColours = Map(
    ("frontend-router",       ChartFormat(Colour.`tone-news-1`)),
    ("frontend-article",      ChartFormat(Colour.`tone-news-1`)),
    ("frontend-facia",        ChartFormat(Colour.`tone-news-1`)),
    ("frontend-applications", ChartFormat(Colour.`tone-news-1`)),
    ("frontend-discussion",   ChartFormat(Colour.`tone-news-2`)),
    ("frontend-identity",     ChartFormat(Colour.`tone-news-2`)),
    ("frontend-image",        ChartFormat(Colour.`tone-news-2`)),
    ("frontend-sport",        ChartFormat(Colour.`tone-news-2`)),
    ("frontend-commercial",   ChartFormat(Colour.`tone-news-2`)),
    ("frontend-onward",       ChartFormat(Colour.`tone-news-2`)),
    ("frontend-r2football",   ChartFormat(Colour.`tone-news-2`)),
    ("frontend-diagnostics",  ChartFormat(Colour.`tone-news-2`)),
    ("frontend-archive",      ChartFormat(Colour.`tone-news-2`)),
    ("frontend-rss",          ChartFormat(Colour.`tone-news-2`))
  ).withDefaultValue(ChartFormat.SingleLineBlack)

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
    "commercial.js",
    "facia.js",
    "content.css",
    "head.commercial.css",
    "head.content.css",
    "head.facia.css",
    "head.football.css",
    "head.identity.css",
    "head.index.css"
  )

  def shortStackLatency = latency(primaryLoadBalancers)

  def fullStackLatency = for {
    shortLatency <- shortStackLatency
    secondaryLatency <- latency(secondaryLoadBalancers)
  } yield shortLatency ++ secondaryLatency

  def withErrorLogging[A](future: Future[A]): Future[A] = {
    future onFailure {
      case exception: Exception =>
        log.info(s"CloudWatch error: ${exception.getMessage}")

        // temporary till JVM bug fix comes out
        // see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
        if (exception.getMessage.contains("JAXP00010001")) {
          HealthCheck.break()
        }
    }

    future
  }

  // TODO - this file is getting a bit long/ complicated. It needs to be split up a bit
  private def latency(loadBalancers: Seq[LoadBalancer]) = {
    Future.traverse(loadBalancers) { loadBalancer =>
      withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(2).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withUnit(StandardUnit.Seconds)
        .withStatistics("Average")
        .withNamespace("AWS/ELB")
        .withMetricName("Latency")
        .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer.id))
      )) map { metricsResult =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "latency (ms)"), chartColours(loadBalancer.project), metricsResult)
      }
    }
  }

  def requestOkShortStack = requestOkCount(primaryLoadBalancers)

  def requestOkFullStack = for {
    primary <- requestOkShortStack
    secondary <- requestOkCount(secondaryLoadBalancers)
  } yield primary ++ secondary

  private def requestOkCount(loadBalancers: Seq[LoadBalancer]) = {
    Future.traverse(loadBalancers) { loadBalancer =>
      withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(2).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(60)
        .withStatistics("Sum")
        .withNamespace("AWS/ELB")
        .withMetricName("HTTPCode_Backend_2XX")
        .withDimensions(new Dimension().withName("LoadBalancerName").withValue(loadBalancer.id)))) map { metricsResult =>
        new AwsLineChart(loadBalancer.name, Seq("Time", "2xx/minute"), ChartFormat(Colour.success), metricsResult)
      }
    }
  }

  def fastlyErrors = Future.traverse(fastlyMetrics) { case (graphTitle, metric, region, service) =>
    withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(6).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(120)
      .withStatistics("Average")
      .withNamespace("Fastly")
      .withMetricName(metric)
      .withDimensions(new Dimension().withName("region").withValue(region),
        new Dimension().withName("service").withValue(service)))) map { metricsResult =>
      new AwsLineChart(graphTitle, Seq("Time", metric), ChartFormat(Colour.`tone-features-2`), metricsResult)
    }
  }

  def cost = withErrorLogging(defaultClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
    .withNamespace("AWS/Billing")
    .withMetricName("EstimatedCharges")
    .withStartTime(new DateTime().toLocalDate.toDate)
    .withEndTime(new DateTime().toDate)
    .withStatistics("Maximum")
    .withPeriod(60 * 60 * 24)
    .withDimensions(new Dimension().withName("Currency").withValue("USD")))).map(MaximumMetric.apply)

  def fastlyHitMissStatistics = Future.traverse(fastlyHitMissMetrics) { case (graphTitle, region, service) =>
    for {
      hits <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName("hits")
        .withDimensions(
          new Dimension().withName("region").withValue(region),
          new Dimension().withName("service").withValue(service)
        ))
      )

      misses <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withStartTime(new DateTime().minusHours(6).toDate)
        .withEndTime(new DateTime().toDate)
        .withPeriod(120)
        .withStatistics("Average")
        .withNamespace("Fastly")
        .withMetricName("miss")
        .withDimensions(
          new Dimension().withName("region").withValue(region),
          new Dimension().withName("service").withValue(service)
        )
      ))
    } yield new AwsLineChart(graphTitle, Seq("Time", "Hits", "Misses"), ChartFormat(Colour.success, Colour.error), hits, misses)
  }

  def omnitureConfidence = for {
    percentConversion <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("omniture-percent-conversion")
      .withDimensions(stage)))
  } yield new AwsLineChart("omniture-percent-conversion", Seq("Time", "%"), ChartFormat.SingleLineBlue, percentConversion)

  def ophanConfidence = for {
    metric <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("ophan-percent-conversion")
      .withDimensions(stage)))
  } yield new AwsLineChart("ophan-percent-conversion", Seq("Time", "%"), ChartFormat.SingleLineBlue, metric)

  def user50x = for {
    metric <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName("kpis-user-50x")
      .withDimensions(stage)))
  } yield new AwsLineChart("User 50x", Seq("Time", "50x/min"), ChartFormat.SingleLineRed, metric)


  object headlineTests {

    private def get(metricName: String) = euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusHours(6).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(60)
      .withStatistics("Sum")
      .withNamespace("Diagnostics")
      .withMetricName(metricName)
      .withDimensions(stage)
    )

    def control = withErrorLogging(
      for {
        viewed <- get("headlines-control-seen")
        clicked <- get("headlines-control-clicked")
      } yield new AwsLineChart(
        "Control Group",
        Seq("", "Saw the headline", "Clicked the headline"),
        ChartFormat.DoubleLineBlueRed,
        viewed,
        clicked
      )
    )

    def variant = withErrorLogging(
      for {
        viewed <- get("headlines-variant-seen")
        clicked <- get("headlines-variant-clicked")
      } yield new AwsLineChart(
        "Test Group",
        Seq("cccc", "Saw the headline", "Clicked the headline"),
        ChartFormat.DoubleLineBlueRed,
        viewed,
        clicked
      )
    )
  }


  def ratioConfidence = for {
    metric <- withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
      .withStartTime(new DateTime().minusWeeks(2).toDate)
      .withEndTime(new DateTime().toDate)
      .withPeriod(900)
      .withStatistics("Average")
      .withNamespace("Analytics")
      .withMetricName("omniture-ophan-correlation")
      .withDimensions(stage)))
  } yield new AwsLineChart("omniture-ophan-correlation", Seq("Time", "%"), ChartFormat.SingleLineBlue, metric)

  def AbMetricNames() = {
    withErrorLogging(euWestClient.listMetricsFuture(new ListMetricsRequest()
      .withNamespace("AbTests")
      .withDimensions(stageFilter)
    ))
  }

  def eventualAdResponseConfidenceGraph: Future[AwsLineChart] = {

    def getMetric(metricName: String): Future[GetMetricStatisticsResult] = {
      val now = DateTime.now()
      withErrorLogging(euWestClient.getMetricStatisticsFuture(new GetMetricStatisticsRequest()
        .withNamespace("Diagnostics")
        .withMetricName(metricName)
        .withStartTime(now.minusWeeks(2).toDate)
        .withEndTime(now.toDate)
        .withPeriod(900)
        .withStatistics("Sum")
        .withDimensions(new Dimension().withName("Stage").withValue("prod"))))
    }

    def compare(pvCount: GetMetricStatisticsResult,
                pvWithAdCount: GetMetricStatisticsResult): GetMetricStatisticsResult = {

      val pvWithAdCountMap = pvWithAdCount.getDatapoints.map { point =>
        point.getTimestamp -> point.getSum.toDouble
      }.toMap

      val confidenceValues = pvCount.getDatapoints.foldLeft(List.empty[Datapoint]) {
        case (soFar, pvCountValue) =>
          val confidenceValue = pvWithAdCountMap.get(pvCountValue.getTimestamp).map {
            pvWithAdCountValue => pvWithAdCountValue * 100 / pvCountValue.getSum.toDouble
          }.getOrElse(0d)
          soFar :+ new Datapoint().withTimestamp(pvCountValue.getTimestamp).withSum(confidenceValue)
      }

      new GetMetricStatisticsResult().withDatapoints(confidenceValues)
    }

    for {
      pageViewCount <- getMetric("kpis-page-views")
      pageViewWithAdCount <- getMetric("first-ad-rendered")
    } yield {
      val confidenceMetric = compare(pageViewCount, pageViewWithAdCount)
      val averageMetric = {
        val dataPoints = confidenceMetric.getDatapoints
        val average = dataPoints.map(_.getSum.toDouble).sum / dataPoints.length
        val averageDataPoints = dataPoints map { point =>
          new Datapoint().withTimestamp(point.getTimestamp).withSum(average)
        }
        new GetMetricStatisticsResult().withDatapoints(averageDataPoints)
      }
      new AwsLineChart(
        name = "Ad Response Confidence",
        labels = Seq("Time", "%", "avg."),
        ChartFormat(Colour.`tone-comment-2`, Colour.success),
        charts = confidenceMetric, averageMetric
      )
    }
  }
}
