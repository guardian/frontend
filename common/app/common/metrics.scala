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

object ContentApiMetrics {
  object ElasticHttpTimingMetric extends FrontendTimingMetric(
    "elastic-content-api-call-latency",
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
}

object FaciaPressMetrics {
  object FrontPressCronSuccess extends CountMetric(
    "front-press-cron-success",
    "Number of times facia-tool cron job has successfully pressed"
  )
}

trait CloudWatchApplicationMetrics extends GlobalSettings {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension: Dimension = new Dimension().withName("ApplicationName").withValue(applicationName)
  def applicationName: String
  def applicationMetrics: List[FrontendMetric] = Nil

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
    if (Configuration.environment.isNonProd && Switches.MetricsSwitch.isSwitchedOn) {
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
