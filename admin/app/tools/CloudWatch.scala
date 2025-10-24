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

case class MaximumMetric(metric: GetMetricStatisticsResult) {
  lazy val max: Double = metric.getDatapoints.asScala.headOption.map(_.getMaximum.doubleValue()).getOrElse(0.0)
}

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

  private val fastlyMetrics = List(
    ("Fastly Errors (Europe) - errors per minute, average", "europe-errors"),
    ("Fastly Errors (USA) - errors per minute, average", "usa-errors"),
  )

  private val fastlyHitMissMetrics = List(
    ("Fastly Hits and Misses (Europe) - per minute, average", "europe"),
    ("Fastly Hits and Misses (USA) - per minute, average", "usa"),
  )

  def withErrorLogging[A](future: Future[A])(implicit executionContext: ExecutionContext): Future[A] = {
    future.failed.foreach { exception: Throwable =>
      log.error(s"CloudWatch error: ${exception.getMessage}", exception)
    }
    future
  }

  def fastlyErrors()(implicit executionContext: ExecutionContext): Future[List[AwsLineChart]] =
    Future.traverse(fastlyMetrics) { case (graphTitle, metric) =>
      withErrorLogging(
        euWestClient.getMetricStatisticsFuture(
          new GetMetricStatisticsRequest()
            .withStartTime(new DateTime().minusHours(6).toDate)
            .withEndTime(new DateTime().toDate)
            .withPeriod(120)
            .withStatistics("Average")
            .withNamespace("Fastly")
            .withDimensions(stage)
            .withMetricName(metric),
        ),
      ) map { metricsResult =>
        new AwsLineChart(graphTitle, Seq("Time", metric), ChartFormat(Colour.`tone-features-2`), metricsResult)
      }
    }

  def fastlyHitMissStatistics()(implicit executionContext: ExecutionContext): Future[List[AwsLineChart]] =
    Future.traverse(fastlyHitMissMetrics) { case (graphTitle, region) =>
      for {
        hits <- withErrorLogging(
          euWestClient.getMetricStatisticsFuture(
            new GetMetricStatisticsRequest()
              .withStartTime(new DateTime().minusHours(6).toDate)
              .withEndTime(new DateTime().toDate)
              .withPeriod(120)
              .withStatistics("Average")
              .withNamespace("Fastly")
              .withMetricName(s"$region-hits")
              .withDimensions(stage),
          ),
        )

        misses <- withErrorLogging(
          euWestClient.getMetricStatisticsFuture(
            new GetMetricStatisticsRequest()
              .withStartTime(new DateTime().minusHours(6).toDate)
              .withEndTime(new DateTime().toDate)
              .withPeriod(120)
              .withStatistics("Average")
              .withNamespace("Fastly")
              .withMetricName(s"$region-miss")
              .withDimensions(stage),
          ),
        )
      } yield new AwsLineChart(
        graphTitle,
        Seq("Time", "Hits", "Misses"),
        ChartFormat(Colour.success, Colour.error),
        hits,
        misses,
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

  def routerBackend50x()(implicit executionContext: ExecutionContext): Future[AwsLineChart] = {
    val dimension = new Dimension()
      .withName("LoadBalancerName")
      .withValue(LoadBalancer("frontend-router").fold("unknown")(_.id))
    for {
      metric <- withErrorLogging(
        euWestClient.getMetricStatisticsFuture(
          new GetMetricStatisticsRequest()
            .withStartTime(new DateTime().minusHours(2).toDate)
            .withEndTime(new DateTime().toDate)
            .withPeriod(60)
            .withStatistics("Sum")
            .withNamespace(v1LoadBalancerNamespace)
            .withMetricName("HTTPCode_Backend_5XX")
            .withDimensions(dimension),
        ),
      )
    } yield new AwsLineChart("Router 50x", Seq("Time", "50x/min"), ChartFormat.SingleLineRed, metric)
  }

  object headlineTests {

    private def get(
        metricName: String,
    )(implicit executionContext: ExecutionContext): Future[GetMetricStatisticsResult] =
      euWestClient.getMetricStatisticsFuture(
        new GetMetricStatisticsRequest()
          .withStartTime(new DateTime().minusHours(6).toDate)
          .withEndTime(new DateTime().toDate)
          .withPeriod(60)
          .withStatistics("Sum")
          .withNamespace("Diagnostics")
          .withMetricName(metricName)
          .withDimensions(stage),
      )

    def control()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
      withErrorLogging(
        for {
          viewed <- get("headlines-control-seen")
          clicked <- get("headlines-control-clicked")
        } yield new AwsLineChart(
          "Control Group",
          Seq("", "Saw the headline", "Clicked the headline"),
          ChartFormat.DoubleLineBlueRed,
          viewed,
          clicked,
        ),
      )

    def variant()(implicit executionContext: ExecutionContext): Future[AwsLineChart] =
      withErrorLogging(
        for {
          viewed <- get("headlines-variant-seen")
          clicked <- get("headlines-variant-clicked")
        } yield new AwsLineChart(
          "Test Group",
          Seq("cccc", "Saw the headline", "Clicked the headline"),
          ChartFormat.DoubleLineBlueRed,
          viewed,
          clicked,
        ),
      )
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

  def eventualAdResponseConfidenceGraph()(implicit executionContext: ExecutionContext): Future[AwsLineChart] = {

    def getMetric(metricName: String): Future[GetMetricStatisticsResult] = {
      val now = DateTime.now()
      withErrorLogging(
        euWestClient.getMetricStatisticsFuture(
          new GetMetricStatisticsRequest()
            .withNamespace("Diagnostics")
            .withMetricName(metricName)
            .withStartTime(now.minusWeeks(2).toDate)
            .withEndTime(now.toDate)
            .withPeriod(900)
            .withStatistics("Sum")
            .withDimensions(stage),
        ),
      )
    }

    def compare(
        pvCount: GetMetricStatisticsResult,
        pvWithAdCount: GetMetricStatisticsResult,
    ): GetMetricStatisticsResult = {

      val pvWithAdCountMap = pvWithAdCount.getDatapoints.asScala.map { point =>
        point.getTimestamp -> point.getSum.toDouble
      }.toMap

      val confidenceValues = pvCount.getDatapoints.asScala.foldLeft(List.empty[Datapoint]) {
        case (soFar, pvCountValue) =>
          val confidenceValue = pvWithAdCountMap
            .get(pvCountValue.getTimestamp)
            .map { pvWithAdCountValue =>
              pvWithAdCountValue * 100 / pvCountValue.getSum.toDouble
            }
            .getOrElse(0d)
          soFar :+ new Datapoint().withTimestamp(pvCountValue.getTimestamp).withSum(confidenceValue)
      }

      new GetMetricStatisticsResult().withDatapoints(confidenceValues.asJava)
    }

    for {
      pageViewCount <- getMetric("kpis-page-views")
      pageViewWithAdCount <- getMetric("first-ad-rendered")
    } yield {
      val confidenceMetric = compare(pageViewCount, pageViewWithAdCount)
      val averageMetric = {
        val dataPoints = confidenceMetric.getDatapoints
        val average = dataPoints.asScala.map(_.getSum.toDouble).sum / dataPoints.asScala.length
        val averageDataPoints = dataPoints.asScala map { point =>
          new Datapoint().withTimestamp(point.getTimestamp).withSum(average)
        }
        new GetMetricStatisticsResult().withDatapoints(averageDataPoints.asJava)
      }
      new AwsLineChart(
        name = "Ad Response Confidence",
        labels = Seq("Time", "%", "avg."),
        ChartFormat(Colour.`tone-comment-2`, Colour.success),
        charts = confidenceMetric,
        averageMetric,
      )
    }
  }
}
