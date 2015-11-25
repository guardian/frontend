package common

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit}
import conf.Configuration
import conf.switches.Switches
import metrics.{CountMetric, FrontendMetric, FrontendTimingMetric, GaugeMetric}
import model.diagnostics.CloudWatch
import play.api.{GlobalSettings, Application => PlayApp}

import scala.collection.JavaConversions._

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

  object MaxHeapMemoryMetric extends GaugeMetric("max-heap-memory", "Max heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax / 1048576
  )

  object UsedHeapMemoryMetric extends GaugeMetric("used-heap-memory", "Used heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed / 1048576
  )

  object MaxNonHeapMemoryMetric extends GaugeMetric("max-non-heap-memory", "Max non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax / 1048576
  )

  object UsedNonHeapMemoryMetric extends GaugeMetric("used-non-heap-memory", "Used non heap memory (MB)",
    () => ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed / 1048576
  )

  object AvailableProcessorsMetric extends GaugeMetric("available-processors", "Available processors",
    () => ManagementFactory.getOperatingSystemMXBean.getAvailableProcessors
  )

  object FreeDiskSpaceMetric extends GaugeMetric("free-disk-space", "Free disk space (MB)",
    () => new File("/").getUsableSpace / 1048576
  )

  object TotalDiskSpaceMetric extends GaugeMetric("total-disk-space", "Total disk space (MB)",
    () => new File("/").getTotalSpace / 1048576
  )

  object ThreadCountMetric extends GaugeMetric("thread-count", "Thread Count",
    () => ManagementFactory.getThreadMXBean.getThreadCount,
    StandardUnit.Count
  )

  // yeah, casting to com.sun.. ain't too pretty
  object TotalPhysicalMemoryMetric extends GaugeMetric("total-physical-memory", "Total physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getTotalPhysicalMemorySize
      case _ => -1
    }
  )

  object FreePhysicalMemoryMetric extends GaugeMetric("free-physical-memory", "Free physical memory",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => b.getFreePhysicalMemorySize
      case _ => -1
    }
  )

  object OpenFileDescriptorsMetric extends GaugeMetric("open-file-descriptors", "Open file descriptors",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.UnixOperatingSystemMXBean => b.getOpenFileDescriptorCount
      case _ => -1
    }
  )

  object MaxFileDescriptorsMetric extends GaugeMetric("max-file-descriptors", "Max file descriptors",
    () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.UnixOperatingSystemMXBean => b.getMaxFileDescriptorCount
      case _ => -1
    }
  )

  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _ => -1 // dev machines do not have a build number
  }

  object BuildNumberMetric extends GaugeMetric("build-number", "Build number",
    () => buildNumber,
    StandardUnit.None
  )
}

object S3Metrics {
  object S3ClientExceptionsMetric extends CountMetric(
    "s3-client-exceptions",
    "Number of times the AWS S3 client has thrown an Exception"
  )

  object S3AuthorizationError extends CountMetric(
    "s3-authorization-errors",
    "Number of requests to S3 by facia that have resulted in a 403"
  )
}

object ContentApiMetrics {
  object ElasticHttpTimingMetric extends FrontendTimingMetric(
    "elastic-content-api-calls",
    "Elastic outgoing requests to content api"
  )

  object ElasticHttpTimeoutCountMetric extends CountMetric(
    "elastic-content-api-timeouts",
    "Elastic Content api calls that timeout"
  )

  object ContentApiErrorMetric extends CountMetric(
    "content-api-errors",
    "Number of times the Content API returns errors (not counting when circuit breaker is on)"
  )

  object ContentApi404Metric extends CountMetric(
    "content-api-404",
    "Number of times the Content API has responded with a 404"
  )

  object ContentApiJsonParseExceptionMetric extends CountMetric(
    "content-api-client-parse-exceptions",
    "Number of times the Content API client has thrown a ParseException"
  )

  object ContentApiJsonMappingExceptionMetric extends CountMetric(
    "content-api-client-mapping-exceptions",
    "Number of times the Content API client has thrown a MappingException"
  )

  object ContentApiCircuitBreakerRequestsMetric extends CountMetric(
    "content-api-circuit-breaker-requests",
    "Number of requests immediately rejected due to the circuit breaker being tripped"
  )

  object ContentApiCircuitBreakerOnOpen extends CountMetric(
    "content-api-circuit-breaker-on-open-changes",
    "Number of times circuit breaker is put into the onOpen state"
  )
}

object PaMetrics {
  object PaApiHttpTimingMetric extends FrontendTimingMetric(
    "pa-api-calls",
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

  val all: Seq[FrontendMetric] = Seq(PaApiHttpTimingMetric, PaApiHttpOkMetric, PaApiHttpErrorMetric)
}

object DiscussionMetrics {
  object DiscussionHttpTimingMetric extends FrontendTimingMetric(
    "discussion-api-calls",
    "outgoing requests to discussion api"
  )
}

object AdminMetrics {
  object ConfigUpdateCounter extends CountMetric("config_updates", "number of times config was updated")
  object ConfigUpdateErrorCounter extends CountMetric("config_update_errors", "number of times config update failed")

  object SwitchesUpdateCounter extends CountMetric("switches_updates", "number of times switches was updated")
  object SwitchesUpdateErrorCounter extends CountMetric("switches_update_errors", "number of times switches update failed")
}

object FaciaMetrics {

  object FaciaToApplicationRedirectMetric extends CountMetric(
    "redirects-to-applications",
    "Number of requests to facia that have been redirected to Applications via X-Accel-Redirect"
  )

  object FaciaToRssRedirectMetric extends CountMetric(
    "redirects-to-rss",
    "Number of requests to Facia that have been redirected to RSS via X-Accel-Redirect"
  )
}

object FaciaPressMetrics {
  object FrontPressSuccess extends CountMetric(
    "facia-front-press-success",
    "Number of times facia-tool has successfully pressed"
  )

  object FrontPressLiveSuccess extends CountMetric(
    "front-press-live-success",
    "Number of times facia-tool has successfully pressed live"
  )

  object FrontPressLiveFailure extends CountMetric(
    "front-press-live-failure",
    "Number of times facia-tool has had a failure in pressing live"
  )

  object FrontPressFailure extends CountMetric(
    "facia-front-press-failure",
    "Number of times facia-tool has had a failure in pressing"
  )

  object FrontPressDraftSuccess extends CountMetric(
    "front-press-draft-success",
    "Number of times facia-tool has successfully pressed draft"
  )

  object FrontPressDraftFailure extends CountMetric(
    "front-press-draft-failure",
    "Number of times facia-tool has had a failure in pressing draft"
  )

  object FrontPressCronSuccess extends CountMetric(
    "front-press-cron-success",
    "Number of times facia-tool cron job has successfully pressed"
  )

  object FrontPressCronFailure extends CountMetric(
    "front-press-cron-failure",
    "Number of times facia-tool cron job has had a failure in pressing"
  )

  object MemcachedFallbackMetric extends CountMetric(
    "content-api-fallbacks",
    "Number of times the Memcached Fallback was used"
  )

  object ContentApiSeoRequestSuccess extends CountMetric(
    "content-api-seo-request-success",
    "Number of times facia-tool has successfully made the request for SEO purposes of webTitle and section"
  )

  object ContentApiSeoRequestFailure extends CountMetric(
    "content-api-seo-request-failure",
    "Number of times facia-tool has failed to made the request for SEO purposes of webTitle and section"
  )

}

object FaciaToolMetrics {
  object ApiUsageCount extends CountMetric(
    "api-usage",
    "Number of requests to the Facia API from clients (The tool)"
  )

  object ProxyCount extends CountMetric(
    "api-proxy-usage",
    "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
  )

  object ExpiredRequestCount extends CountMetric(
    "auth-expired",
    "Number of expired requests coming into an endpoint using ExpiringAuthAction"
  )

  object DraftPublishCount extends CountMetric(
    "draft-publish",
    "Number of drafts that have been published"
  )

  object ContentApiPutSuccess extends CountMetric(
    "content-api-put-success",
    "Number of PUT requests that have been successful to the content api"
  )

  object ContentApiPutFailure extends CountMetric(
    "content-api-put-failure",
    "Number of PUT requests that have failed to the content api"
  )

  object InvalidContentExceptionMetric extends CountMetric(
    "content-api-invalid-content-exceptions",
    "Number of times facia/facia-tool has thrown InvalidContent exceptions"
  )

  object EnqueuePressSuccess extends CountMetric(
    "faciatool-enqueue-press-success",
    "Number of successful enqueuing of press commands"
  )

  object EnqueuePressFailure extends CountMetric(
    "faciatool-enqueue-press-failure",
    "Number of failed enqueuing of press commands"
  )
}

object CommercialMetrics {

  object TravelOffersLoadTimingMetric extends FrontendTimingMetric(
    "commercial-travel-offers-load",
    "Time spent running travel offers data load jobs"
  )

  object MasterClassesLoadTimingMetric extends FrontendTimingMetric(
    "commercial-masterclasses-load",
    "Time spent running MasterClasses load jobs"
  )

  object JobsLoadTimingMetric extends FrontendTimingMetric(
    "commercial-jobs-load",
    "Time spent running job ad data load jobs"
  )

  object SoulmatesLoadTimingMetric extends FrontendTimingMetric(
    "commercial-soulmates-load",
    "Time spent running soulmates ad data load jobs"
  )

  val all = Seq(TravelOffersLoadTimingMetric, JobsLoadTimingMetric, MasterClassesLoadTimingMetric, SoulmatesLoadTimingMetric)
}

object OnwardMetrics {
  object OnwardLoadTimingMetric extends FrontendTimingMetric(
    "onward-most-popular-load",
    "Time spent running onward journey data load jobs"
  )

  val all = Seq(OnwardLoadTimingMetric)
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

object WeatherMetrics {
  val whatIsMyCityRequests = CountMetric(
    "what-is-my-city-requests",
    "Count of requests for user's location"
  )
}

trait CloudWatchApplicationMetrics extends GlobalSettings {
  import common.MemcachedMetrics._
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension = new Dimension().withName("ApplicationName").withValue(applicationName)
  def applicationName: String
  def applicationMetrics: List[FrontendMetric] = List(FilterCacheHit, FilterCacheMiss) ++ PaMetrics.all

  def systemMetrics: List[FrontendMetric] = List(
    SystemMetrics.MaxHeapMemoryMetric,
    SystemMetrics.UsedHeapMemoryMetric,
    SystemMetrics.TotalPhysicalMemoryMetric,
    SystemMetrics.FreePhysicalMemoryMetric,
    SystemMetrics.AvailableProcessorsMetric,
    SystemMetrics.BuildNumberMetric,
    SystemMetrics.FreeDiskSpaceMetric,
    SystemMetrics.TotalDiskSpaceMetric,
    SystemMetrics.MaxFileDescriptorsMetric,
    SystemMetrics.OpenFileDescriptorsMetric,
    SystemMetrics.ThreadCountMetric
  ) ++ SystemMetrics.garbageCollectors.flatMap{ gc => List(
      GaugeMetric(s"${gc.name}-gc-count-per-min" , "Used heap memory (MB)",
        () => gc.gcCount.toLong,
        StandardUnit.Count
      ),
      GaugeMetric(s"${gc.name}-gc-time-per-min", "Used heap memory (MB)",
        () => gc.gcTime.toLong,
        StandardUnit.Count
      )
    )}

  private def report() {
    val allMetrics: List[FrontendMetric] = this.systemMetrics ::: this.applicationMetrics
    if (!Configuration.environment.isNonProd || Switches.MetricsSwitch.isSwitchedOn) {
      CloudWatch.putMetricsWithStage(allMetrics, applicationDimension)
    }
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)
    //run every minute, 36 seconds after the minute
    Jobs.schedule("ApplicationSystemMetricsJob", "36 * * * * ?"){
      report()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStop(app)
  }

}
