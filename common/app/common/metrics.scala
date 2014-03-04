package common

import play.api.{Application => PlayApp, Play, GlobalSettings}
import com.gu.management._
import conf.RequestMeasurementMetrics
import java.lang.management.ManagementFactory
import model.diagnostics.CloudWatch
import java.io.File
import java.util.concurrent.atomic.AtomicLong
import com.amazonaws.services.cloudwatch.model.Dimension

trait TimingMetricLogging extends Logging { self: TimingMetric =>
  override def measure[T](block: => T): T = {
    var result: Option[T] = None
    var elapsed = 0L
    val s = new com.gu.management.StopWatch

    try {
      result = Some(block)
      elapsed = s.elapsed
      log.info("%s completed after %s ms" format (name, elapsed))
    } catch {
      case e: Throwable =>
        elapsed = s.elapsed

        log.info("%s halted by exception after %s ms" format (name, elapsed))
        throw e
    } finally {
      self.recordTimeSpent(elapsed)
    }

    result.get
  }
}

object SystemMetrics extends implicits.Numbers {

  // divide by 1048576 to convert bytes to MB

  object MaxHeapMemoryMetric extends GaugeMetric("system", "max-heap-memory", "Max heap memory (MB)", "Max heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax / 1048576
  )

  object UsedHeapMemoryMetric extends GaugeMetric("system", "used-heap-memory", "Used heap memory (MB)", "Used heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed / 1048576
  )

  object MaxNonHeapMemoryMetric extends GaugeMetric("system", "max-non-heap-memory", "Max non heap memory (MB)", "Max non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax / 1048576
  )

  object UsedNonHeapMemoryMetric extends GaugeMetric("system", "used-non-heap-memory", "Used non heap memory (MB)", "Used non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed / 1048576
  )

  //  http://docs.oracle.com/javase/6/docs/api/java/lang/management/OperatingSystemMXBean.html()
  object LoadAverageMetric extends GaugeMetric("system", "load-average", "Load average", "Load average",
    () => ManagementFactory.getOperatingSystemMXBean.getSystemLoadAverage
  )

  object AvailableProcessorsMetric extends GaugeMetric("system", "available-processors", "Available processors", "Available processors",
    () => ManagementFactory.getOperatingSystemMXBean.getAvailableProcessors
  )

  object FreeDiskSpaceMetric extends GaugeMetric("system", "free-disk-space", "Free disk space (MB)", "Free disk space (MB)",
    () => new File("/").getUsableSpace.toDouble / 1048576
  )

  object TotalDiskSpaceMetric extends GaugeMetric("system", "total-disk-space", "Total disk space (MB)", "Total disk space (MB)",
    () => new File("/").getTotalSpace.toDouble / 1048576
  )

  // yeah, casting to com.sun.. ain't too pretty
  object TotalPhysicalMemoryMetric extends GaugeMetric("system", "total-physical-memory", "Total physical memory", "Total physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getTotalPhysicalMemorySize
      case _ => -1
    }
  )

  object FreePhysicalMemoryMetric extends GaugeMetric("system", "free-physical-memory", "Free physical memory", "Free physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getFreePhysicalMemorySize
      case _ => -1
    }
  )


  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _ => -1 // dev machines do not have a build number
  }

  object BuildNumberMetric extends GaugeMetric("application", "build-number", "Build number", "Build number",
    () => buildNumber
  )

  val all = Seq(MaxHeapMemoryMetric, UsedHeapMemoryMetric,
    MaxNonHeapMemoryMetric, UsedNonHeapMemoryMetric, BuildNumberMetric, LoadAverageMetric, AvailableProcessorsMetric,
    TotalPhysicalMemoryMetric, FreePhysicalMemoryMetric, FreeDiskSpaceMetric, TotalDiskSpaceMetric
  )
}

object ContentApiMetrics {
  object HttpTimingMetric extends TimingMetric(
    "performance",
    "content-api-calls",
    "Content API calls",
    "outgoing requests to content api"
  ) with TimingMetricLogging

  object HttpTimeoutCountMetric extends SimpleCountMetric(
    "timeout",
    "content-api-timeouts",
    "Content API timeouts",
    "Content api calls that timeout"
  )

  object ElasticHttpTimingMetric extends TimingMetric(
    "performance",
    "elastic-content-api-calls",
    "Elastic Content API calls",
    "Elastic outgoing requests to content api"
  ) with TimingMetricLogging

  object ElasticHttpTimeoutCountMetric extends SimpleCountMetric(
    "timeout",
    "elastic-content-api-timeouts",
    "Elastic Content API timeouts",
    "Elastic Content api calls that timeout"
  )

  object ContentApi404Metric extends SimpleCountMetric(
    "404",
    "content-api-404-responses",
    "Content API 404 responses",
    "Number of times the Content API has responded with a 404"
  )

  val all: Seq[Metric] = Seq(
    HttpTimingMetric,
    HttpTimeoutCountMetric,
    ElasticHttpTimeoutCountMetric,
    ElasticHttpTimingMetric,
    ContentApi404Metric
  )
}

object PaMetrics {
  object PaApiHttpTimingMetric extends TimingMetric(
    "pa-api",
    "pa-api-calls",
    "PA API calls",
    "outgoing requests to pa api",
    None
  ) with TimingMetricLogging

  object PaApiHttpOkMetric extends CountMetric(
    "pa-api",
    "pa-api-ok",
    "PA API calls OK",
    "AP api returned OK"
  )

  object PaApiHttpErrorMetric extends CountMetric(
    "pa-api",
    "pa-api-error",
    "PA API calls error",
    "AP api returned error"
  )

  val all: Seq[Metric] = Seq(PaApiHttpTimingMetric, PaApiHttpOkMetric, PaApiHttpErrorMetric)
}

object DiscussionMetrics {
  object DiscussionHttpTimingMetric extends TimingMetric(
    "performance",
    "discussion-api-calls",
    "Discussion API calls",
    "outgoing requests to discussion api"
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(DiscussionHttpTimingMetric)
}

object AdminMetrics {
  object ConfigUpdateCounter extends CountMetric("actions", "config_updates", "Config updates", "number of times config was updated")
  object ConfigUpdateErrorCounter extends CountMetric("actions", "config_update_errors", "Config update errors", "number of times config update failed")

  object SwitchesUpdateCounter extends CountMetric("actions", "switches_updates", "Switches updates", "number of times switches was updated")
  object SwitchesUpdateErrorCounter extends CountMetric("actions", "switches_update_errors", "Switches update errors", "number of times switches update failed")

  val all = Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter, SwitchesUpdateCounter, SwitchesUpdateErrorCounter)
}

object FaciaMetrics {

  object JsonParsingErrorCount extends SimpleCountMetric(
    "facia-front",
    "facia-json-error",
    "Facia JSON parsing errors",
    "Number of errors whilst parsing JSON out of S3"
  )

  object S3AuthorizationError extends SimpleCountMetric(
    "facia-front",
    "facia-s3-authorization-403",
    "Facia S3 403 (Unauthorized) error count",
    "Number of requests to S3 by facia that have resulted in a 403"
  )

  val all: Seq[Metric] = Seq(
    JsonParsingErrorCount,
    S3AuthorizationError
  )
}

object FaciaToolMetrics {

  object ApiUsageCount extends SimpleCountMetric(
    "facia-api",
    "facia-api-usage",
    "Facia API usage count",
    "Number of requests to the Facia API from clients (The tool)"
  )

  object ProxyCount extends SimpleCountMetric(
    "facia-api",
    "facia-proxy-usage",
    "Facia proxy usage count",
    "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
  )

  object ExpiredRequestCount extends SimpleCountMetric(
    "facia-api",
    "facia-auth-expired",
    "Facia auth endpoints expired requests",
    "Number of expired requests coming into an endpoint using ExpiringAuthAction"
  )

  object DraftPublishCount extends SimpleCountMetric(
    "facia-api",
    "facia-draft-publish",
    "Facia draft publish count",
    "Number of drafts that have been published"
  )

  object ContentApiPutSuccess extends SimpleCountMetric(
    "facia-api",
    "faciatool-contentapi-put-success",
    "Facia tool contentapi put success count",
    "Number of PUT requests that have been successful to the content api"
  )

  object ContentApiPutFailure extends SimpleCountMetric(
    "facia-api",
    "faciatool-contentapi-put-failure",
    "Facia tool contentapi put failure count",
    "Number of PUT requests that have failed to the content api"
  )

  object FrontPressSuccess extends SimpleCountMetric(
    "facia-front-press",
    "facia-front-press-success",
    "Facia front press success count",
    "Number of times facia-tool has successfully pressed"
  )

  object FrontPressFailure extends SimpleCountMetric(
    "facia-front-press",
    "facia-front-press-failure",
    "Facia front press failue count",
    "Number of times facia-tool has has a failure in pressing"
  )

  object FrontPressCronSuccess extends SimpleCountMetric(
    "facia-front-press",
    "facia-front-press-cron-success",
    "Facia front press cron success count",
    "Number of times facia-tool has successfully pressed"
  )

  object FrontPressCronFailure extends SimpleCountMetric(
    "facia-front-press",
    "facia-front-press-cron-failure",
    "Facia front press cron failue count",
    "Number of times facia-tool has has a failure in pressing"
  )

  val all: Seq[Metric] = Seq(
    ApiUsageCount, ProxyCount, ExpiredRequestCount,
    DraftPublishCount, ContentApiPutSuccess, ContentApiPutFailure,
    FrontPressSuccess, FrontPressFailure, FrontPressCronSuccess,
    FrontPressCronFailure
  )
}

object CommercialMetrics {

  object TravelOffersLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-travel-offers-load",
    "Commercial Travel Offers load timing",
    "Time spent running travel offers data load jobs",
    None
  ) with TimingMetricLogging

  object MasterClassesLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-masterclasses-load",
    "Commercial MasterClasses load timing",
    "Time spent running MasterClasses load jobs",
    None
  ) with TimingMetricLogging

  object JobsLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-jobs-load",
    "Commercial Jobs load timing",
    "Time spent running job ad data load jobs",
    None
  ) with TimingMetricLogging

  object SoulmatesLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-soulmates-load",
    "Commercial Soulmates load timing",
    "Time spent running soulmates ad data load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(TravelOffersLoadTimingMetric, JobsLoadTimingMetric, MasterClassesLoadTimingMetric, SoulmatesLoadTimingMetric)
}

object OnwardMetrics {
  object OnwardLoadTimingMetric extends TimingMetric(
    "onward",
    "onward-most-popular-load",
    "Onward Journey load timing",
    "Time spent running onward journey data load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(OnwardLoadTimingMetric)
}


object Metrics {
  lazy val common = RequestMeasurementMetrics.asMetrics ++ SystemMetrics.all

  lazy val contentApi = ContentApiMetrics.all
  lazy val pa = PaMetrics.all

  lazy val discussion = DiscussionMetrics.all
  lazy val admin = AdminMetrics.all
  lazy val facia = FaciaMetrics.all
  lazy val faciaTool = FaciaToolMetrics.all
}

case class SimpleCountMetric(
                              group: String,
                              name: String,
                              title: String,
                              description: String
                              ) extends AbstractMetric[Long] {
  val count = new AtomicLong(0)
  val currentCount = new AtomicLong(0)
  val `type` = "counter"

  def increment() {
    count.incrementAndGet()
    currentCount.incrementAndGet()
  }

  def getAndReset = currentCount.getAndSet(0)
  val getValue: () => Long = count.get

  override def asJson: StatusMetric = super.asJson.copy(count = Some(getValue().toString))
}

object PerformanceMetrics {
  val dogPileHitMetric = SimpleCountMetric(
    "performance",
    "dogpile-hits",
    "Dogpile Hits",
    "Count of hits through use of DogPile action"
  )

  val dogPileMissMetric = SimpleCountMetric(
    "performance",
    "dogpile-miss",
    "Dogpile Misses",
    "Count of misses through use of DogPile action"
  )
}

trait CloudWatchApplicationMetrics extends GlobalSettings {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension = new Dimension().withName("ApplicationName").withValue(applicationName)
  def applicationName: String
  def applicationMetrics: Map[String, Double] = Map.empty

  def systemMetrics: Map[String, Double] = Map(
    (s"$applicationName-max-heap-memory", SystemMetrics.MaxHeapMemoryMetric.getValue().toDouble),
    (s"$applicationName-used-heap-memory", SystemMetrics.UsedHeapMemoryMetric.getValue().toDouble),

    (s"$applicationName-total-physical-memory", SystemMetrics.TotalPhysicalMemoryMetric.getValue().toDouble),
    (s"$applicationName-free-physical-memory", SystemMetrics.FreePhysicalMemoryMetric.getValue().toDouble),

    (s"$applicationName-available-processors", SystemMetrics.AvailableProcessorsMetric.getValue().toDouble),

    (s"$applicationName-load-average", SystemMetrics.LoadAverageMetric.getValue()),

    (s"$applicationName-build-number", SystemMetrics.BuildNumberMetric.getValue().toDouble),

    (s"$applicationName-free-disk-space", SystemMetrics.FreeDiskSpaceMetric.getValue()),
    (s"$applicationName-total-disk-space", SystemMetrics.TotalDiskSpaceMetric.getValue()),

    (s"$applicationName-dogpile-hits", PerformanceMetrics.dogPileHitMetric.count.getAndSet(0).toDouble),
    (s"$applicationName-dogpile-miss", PerformanceMetrics.dogPileMissMetric.count.getAndSet(0).toDouble)
  )

  def report() {
    val systemMetrics: Map[String, Double] = this.systemMetrics
    val applicationMetrics: Map[String, Double] = this.applicationMetrics
    CloudWatch.put("ApplicationSystemMetrics", systemMetrics)
    if (applicationMetrics.nonEmpty) {
      CloudWatch.putWithDimensions(applicationMetricsNamespace, applicationMetrics, Seq(applicationDimension))
    }
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)

    // don't fire off metrics during test runs
    if (!Play.isTest(app)) {
      Jobs.schedule("ApplicationSystemMetricsJob", "0 * * * * ?"){
        report()
      }
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStop(app)
  }

}
