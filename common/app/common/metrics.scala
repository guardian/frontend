package common

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.Dimension
import metrics.{CountMetric, FrontendMetric}
import model.diagnostics.CloudWatch
import play.api.{GlobalSettings, Application => PlayApp}

import scala.collection.JavaConversions._
import scala.util.Try

object MemcachedMetrics {

  object FilterCacheHit extends CountMetric("memcached-filter-hit", "Memcached filter hits")
  object FilterCacheMiss extends CountMetric("memcached-filter-miss", "Memcached filter misses")

}

object SystemMetrics extends implicits.Numbers {

  class GcRateMetric(bean: GarbageCollectorMXBean) {
    private val lastGcCount = new AtomicLong(0)
    private val lastGcTime = new AtomicLong(0)

    lazy val name = bean.getName.replace(" ", "_")

    def gcCount: Double = {
      val totalGcCount = bean.getCollectionCount
      totalGcCount - lastGcCount.getAndSet(totalGcCount)
    }

    def gcTime: Double = {
      val totalGcTime = bean.getCollectionTime
      totalGcTime - lastGcTime.getAndSet(totalGcTime)
    }
  }


  lazy val garbageCollectors: Seq[GcRateMetric] = ManagementFactory.getGarbageCollectorMXBeans.map(new GcRateMetric(_))


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

object S3Metrics {
  object S3ClientExceptionsMetric extends CountMetric(
    "s3-client-exception",
    "Number of times the AWS S3 client has thrown an Exception"
  )

  object S3AuthorizationError extends CountMetric(
    "facia-s3-authorization-403",
    "Number of requests to S3 by facia that have resulted in a 403"
  )

  val all = Seq(S3ClientExceptionsMetric, S3AuthorizationError)
}

object ContentApiMetrics {
  object ElasticHttpTimingMetric extends FrontendTimingMetric(
    "performance",
    "elastic-content-api-calls",
    "Elastic Content API calls",
    "Elastic outgoing requests to content api"
  )

  object ElasticHttpTimeoutCountMetric extends CountMetric(
    "elastic-content-api-timeouts",
    "Elastic Content api calls that timeout"
  )

  object ContentApi404Metric extends CountMetric(
    "content-api-404-responses",
    "Number of times the Content API has responded with a 404"
  )

  object ContentApiJsonParseExceptionMetric extends CountMetric(
    "content-api-parse-exception",
    "Number of times the Content API client has thrown a ParseException"
  )

  object ContentApiJsonMappingExceptionMetric extends CountMetric(
    "content-api-mapping-exception",
    "Number of times the Content API client has thrown a MappingException"
  )


  val all = Seq(
    ElasticHttpTimeoutCountMetric,
    ElasticHttpTimingMetric,
    ContentApi404Metric,
    ContentApiJsonParseExceptionMetric,
    ContentApiJsonMappingExceptionMetric
  )
}

object PaMetrics {
  object PaApiHttpTimingMetric extends FrontendTimingMetric(
    "pa-api",
    "pa-api-calls",
    "PA API calls",
    "outgoing requests to pa api"
  )

  object PaApiHttpOkMetric extends CountMetric(
    "pa-api-ok",
    "AP api returned OK"
  )

  object PaApiHttpErrorMetric extends CountMetric(
    "pa-api-error",
    "AP api returned error"
  )

  val all = Seq(PaApiHttpTimingMetric, PaApiHttpOkMetric, PaApiHttpErrorMetric)
}

object DiscussionMetrics {
  object DiscussionHttpTimingMetric extends FrontendTimingMetric(
    "performance",
    "discussion-api-calls",
    "Discussion API calls",
    "outgoing requests to discussion api"
  )

  val all = Seq(DiscussionHttpTimingMetric)
}

object AdminMetrics {
  object ConfigUpdateCounter extends CountMetric("config_updates", "number of times config was updated")
  object ConfigUpdateErrorCounter extends CountMetric("config_update_errors", "number of times config update failed")

  object SwitchesUpdateCounter extends CountMetric("switches_updates", "number of times switches was updated")
  object SwitchesUpdateErrorCounter extends CountMetric("switches_update_errors", "number of times switches update failed")

  val all = Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter, SwitchesUpdateCounter, SwitchesUpdateErrorCounter)
}

object FaciaMetrics {

  object JsonParsingErrorCount extends CountMetric(
    "facia-json-error",
    "Number of errors whilst parsing JSON out of S3"
  )

  object FaciaToApplicationRedirectMetric extends CountMetric(
    "facia-applications-redirects",
    "Number of requests to facia that have been redirected to Applications via X-Accel-Redirect"
  )

  val all = Seq(
    JsonParsingErrorCount,
    FaciaToApplicationRedirectMetric
  ) ++ S3Metrics.all
}

object FaciaPressMetrics {
  object FrontPressSuccess extends CountMetric(
    "facia-front-press-success",
    "Number of times facia-tool has successfully pressed"
  )

  object FrontPressLiveSuccess extends CountMetric(
    "facia-front-press-live-success",
    "Number of times facia-tool has successfully pressed live"
  )

  object FrontPressLiveFailure extends CountMetric(
    "facia-front-press-live-failure",
    "Number of times facia-tool has had a failure in pressing live"
  )

  object FrontPressFailure extends CountMetric(
    "facia-front-press-failure",
    "Number of times facia-tool has had a failure in pressing"
  )

  object FrontPressDraftSuccess extends CountMetric(
    "facia-front-press-draft-success",
    "Number of times facia-tool has successfully pressed draft"
  )

  object FrontPressDraftFailure extends CountMetric(
    "facia-front-press-draft-failure",
    "Number of times facia-tool has had a failure in pressing draft"
  )

  object FrontPressCronSuccess extends CountMetric(
    "facia-front-press-cron-success",
    "Number of times facia-tool cron job has successfully pressed"
  )

  object FrontPressCronFailure extends CountMetric(
    "facia-front-press-cron-failure",
    "Number of times facia-tool cron job has had a failure in pressing"
  )

  object MemcachedFallbackMetric extends CountMetric(
    "facia-press-memcached-fallbacks",
    "Number of times the Memcached Fallback was used"
  )

  object ContentApiSeoRequestSuccess extends CountMetric(
    "facia-seo-request-success",
    "Number of times facia-tool has successfully made the request for SEO purposes of webTitle and section"
  )

  object ContentApiSeoRequestFailure extends CountMetric(
    "facia-seo-request-failure",
    "Number of times facia-tool has failed to made the request for SEO purposes of webTitle and section"
  )

  val all = Seq(
    FrontPressSuccess,
    FrontPressLiveSuccess,
    FrontPressLiveFailure,
    FrontPressFailure,
    FrontPressDraftSuccess,
    FrontPressDraftFailure,
    FrontPressCronSuccess,
    FrontPressCronFailure,
    MemcachedFallbackMetric,
    ContentApiSeoRequestSuccess,
    ContentApiSeoRequestFailure
  )
}

object FaciaToolMetrics {
  object ApiUsageCount extends metrics.CountMetric(
    "facia-api-usage",
    "Number of requests to the Facia API from clients (The tool)"
  )

  object ProxyCount extends metrics.CountMetric(
    "facia-proxy-usage",
    "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
  )

  object ExpiredRequestCount extends metrics.CountMetric(
    "facia-auth-expired",
    "Number of expired requests coming into an endpoint using ExpiringAuthAction"
  )

  object DraftPublishCount extends metrics.CountMetric(
    "facia-draft-publish",
    "Number of drafts that have been published"
  )

  object ContentApiPutSuccess extends metrics.CountMetric(
    "faciatool-contentapi-put-success",
    "Number of PUT requests that have been successful to the content api"
  )

  object ContentApiPutFailure extends metrics.CountMetric(
    "faciatool-contentapi-put-failure",
    "Number of PUT requests that have failed to the content api"
  )

  object InvalidContentExceptionMetric extends metrics.CountMetric(
    "facia-invalid-content",
    "Number of times facia/facia-tool has thrown InvalidContent exceptions"
  )

  object EnqueuePressSuccess extends metrics.CountMetric(
    "faciatool-enqueue-press-success",
    "Number of successful enqueuing of press commands"
  )

  object EnqueuePressFailure extends metrics.CountMetric(
    "faciatool-enqueue-press-failure",
    "Number of failed enqueuing of press commands"
  )
}

object CommercialMetrics {

  object TravelOffersLoadTimingMetric extends FrontendTimingMetric(
    "commercial",
    "commercial-travel-offers-load",
    "Commercial Travel Offers load timing",
    "Time spent running travel offers data load jobs"
  )

  object MasterClassesLoadTimingMetric extends FrontendTimingMetric(
    "commercial",
    "commercial-masterclasses-load",
    "Commercial MasterClasses load timing",
    "Time spent running MasterClasses load jobs"
  )

  object JobsLoadTimingMetric extends FrontendTimingMetric(
    "commercial",
    "commercial-jobs-load",
    "Commercial Jobs load timing",
    "Time spent running job ad data load jobs"
  )

  object SoulmatesLoadTimingMetric extends FrontendTimingMetric(
    "commercial",
    "commercial-soulmates-load",
    "Commercial Soulmates load timing",
    "Time spent running soulmates ad data load jobs"
  )

  val all = Seq(TravelOffersLoadTimingMetric, JobsLoadTimingMetric, MasterClassesLoadTimingMetric, SoulmatesLoadTimingMetric)
}

object OnwardMetrics {
  object OnwardLoadTimingMetric extends FrontendTimingMetric(
    "onward",
    "onward-most-popular-load",
    "Onward Journey load timing",
    "Time spent running onward journey data load jobs"
  )

  val all = Seq(OnwardLoadTimingMetric)
}


object Metrics {
  lazy val common = SystemMetrics.all

  lazy val contentApi = ContentApiMetrics.all
  lazy val pa = PaMetrics.all

  lazy val discussion = DiscussionMetrics.all
  lazy val admin = AdminMetrics.all
  lazy val facia = FaciaMetrics.all
  lazy val faciaPress = FaciaPressMetrics.all
}

class FrontendTimingMetric(
                            group: String,
                            name: String,
                            title: String,
                            description: String) {

  private val timeInMillis = new AtomicLong()
  private val currentCount = new AtomicLong()

  def recordTimeSpent(durationInMillis: Long) {
    timeInMillis.addAndGet(durationInMillis)
    currentCount.incrementAndGet
  }
  def totalTimeInMillis = timeInMillis.get
  def count = currentCount.get
  val getValue = () => totalTimeInMillis

  def getAndReset: Long = currentCount.getAndSet(0)
  def getAndResetTime: Long = Try(timeInMillis.getAndSet(0) / currentCount.getAndSet(0)).getOrElse(0L)
}

object PerformanceMetrics {
  val dogPileHitMetric = CountMetric(
    "dogpile-hits",
    "Count of hits through use of DogPile action"
  )

  val dogPileMissMetric = CountMetric(
    "dogpile-miss",
    "Count of misses through use of DogPile action"
  )
}

trait CloudWatchApplicationMetrics extends GlobalSettings {
  import common.MemcachedMetrics._
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension = new Dimension().withName("ApplicationName").withValue(applicationName)
  def applicationName: String
  def applicationMetrics: Map[String, Double] = Map(
    (s"$applicationName-${FilterCacheHit.name}", FilterCacheHit.getAndReset),
    (s"$applicationName-${FilterCacheMiss.name}", FilterCacheMiss.getAndReset)
  )

  def systemMetrics: Map[String, Double] = Map(
    (s"$applicationName-max-heap-memory", SystemMetrics.MaxHeapMemoryMetric.getValue().toDouble),
    (s"$applicationName-used-heap-memory", SystemMetrics.UsedHeapMemoryMetric.getValue().toDouble),

    (s"$applicationName-total-physical-memory", SystemMetrics.TotalPhysicalMemoryMetric.getValue().toDouble),
    (s"$applicationName-free-physical-memory", SystemMetrics.FreePhysicalMemoryMetric.getValue().toDouble),

    (s"$applicationName-available-processors", SystemMetrics.AvailableProcessorsMetric.getValue().toDouble),

    (s"$applicationName-load-average", SystemMetrics.LoadAverageMetric.getValue()),

    (s"$applicationName-build-number", SystemMetrics.BuildNumberMetric.getValue().toDouble),

    (s"$applicationName-free-disk-space", SystemMetrics.FreeDiskSpaceMetric.getValue()),
    (s"$applicationName-total-disk-space", SystemMetrics.TotalDiskSpaceMetric.getValue())

  ) ++ SystemMetrics.garbageCollectors.flatMap{ gc => Seq(
    s"$applicationName-${gc.name}-gc-count-per-min" -> gc.gcCount,
    s"$applicationName-${gc.name}-gc-time-per-min" -> gc.gcTime
  )}.toMap

  def latencyMetrics: List[FrontendMetric] = Nil

  private def report() {
    val systemMetrics  = this.systemMetrics
    val applicationMetrics  = this.applicationMetrics
    CloudWatch.put("ApplicationSystemMetrics", systemMetrics)
    for (metrics <- applicationMetrics.grouped(20))
      CloudWatch.putWithDimensions(applicationMetricsNamespace, metrics, Seq(applicationDimension))

    CloudWatch.putMetricsWithStage(latencyMetrics, applicationDimension)
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)

    Jobs.schedule("ApplicationSystemMetricsJob", "0 * * * * ?"){
      report()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStop(app)
  }

}
