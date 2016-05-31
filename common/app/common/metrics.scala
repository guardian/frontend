package common

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit}
import conf.Configuration
import metrics._
import model.diagnostics.CloudWatch
import play.api.{Application => PlayApp, GlobalSettings}

import scala.collection.JavaConversions._
import scala.concurrent.Future

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

  val MaxHeapMemoryMetric = GaugeMetric(
    name = "max-heap-memory",
    description = "Max heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax)
  )

  val UsedHeapMemoryMetric = GaugeMetric(
    name ="used-heap-memory",
    description = "Used heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed)
  )

  val MaxNonHeapMemoryMetric = GaugeMetric(
    name = "max-non-heap-memory",
    description = "Max non heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax)
  )

  val UsedNonHeapMemoryMetric = GaugeMetric(
    name = "used-non-heap-memory",
    description = "Used non heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed)
  )

  val FreeDiskSpaceMetric = GaugeMetric(
    name = "free-disk-space",
    description = "Free disk space (MB)",
    get = () => bytesAsMb(new File("/").getUsableSpace)
  )

  val ThreadCountMetric = GaugeMetric(
    name = "thread-count",
    description = "Thread Count",
    get = () => ManagementFactory.getThreadMXBean.getThreadCount,
    metricUnit = StandardUnit.Count
  )

  // yeah, casting to com.sun.. ain't too pretty
  val TotalPhysicalMemoryMetric = GaugeMetric(
    name = "total-physical-memory", description = "Total physical memory",
    get = () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => bytesAsMb(b.getTotalPhysicalMemorySize)
      case _ => -1
    }
  )

  val FreePhysicalMemoryMetric = GaugeMetric(
    name = "free-physical-memory", description = "Free physical memory",
    get = () => ManagementFactory.getOperatingSystemMXBean match {
      case b: com.sun.management.OperatingSystemMXBean => bytesAsMb(b.getFreePhysicalMemorySize)
      case _ => -1
    }
  )

  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _ => -1 // dev machines do not have a build number
  }

  val BuildNumberMetric = GaugeMetric(
    name = "build-number",
    description = "Build number",
    get = () => buildNumber,
    metricUnit = StandardUnit.None
  )

}

object RequestMetrics {

  val PanicRequestsSurgeMetric = CountMetric(
    name = "panic-requests-surge",
    description = "Number of requests we returned 503 because we received a sudden surge"
  )

  val HighLatencyMetric = CountMetric(
    name = "high-latency",
    description = "Number of requests made when the recent latency was too high"
  )

}

object ContentApiMetrics {
  val HttpLatencyTimingMetric = TimingMetric(
    "content-api-call-latency",
    "Content api call latency"
  )

  val HttpTimeoutCountMetric = CountMetric(
    "content-api-timeouts",
    "Content api calls that timeout"
  )

  val ContentApiErrorMetric = CountMetric(
    "content-api-errors",
    "Number of times the Content API returns errors (not counting when circuit breaker is on)"
  )

  val ContentApi404Metric = CountMetric(
    "content-api-404",
    "Number of times the Content API has responded with a 404"
  )
}

object FaciaPressMetrics {
  val FrontPressCronSuccess = CountMetric(
    "front-press-cron-success",
    "Number of times facia-tool cron job has successfully pressed"
  )

  val UkPressLatencyMetric = DurationMetric("uk-press-latency", StandardUnit.Milliseconds)
  val UsPressLatencyMetric = DurationMetric("us-press-latency", StandardUnit.Milliseconds)
  val AuPressLatencyMetric = DurationMetric("au-press-latency", StandardUnit.Milliseconds)
  val AllFrontsPressLatencyMetric = DurationMetric("front-press-latency", StandardUnit.Milliseconds)
}

object EmailSubsciptionMetrics {
  val AllEmailSubmission = CountMetric("all-email-submission", "Any request to the submit email endpoint")
  val EmailSubmission = CountMetric("email-submission", "Successful POST to the email API Gateway")
  val NotAccepted = CountMetric("email-submission-not-accepted", "Any request with the wrong MIME type")
  val EmailFormError = CountMetric("email-submission-form-error", "Email submission form error")
  val APIHTTPError = CountMetric("email-api-http-error", "Non-200/201 response from email subscription API")
  val APINetworkError = CountMetric("email-api-network-error", "Email subscription API network failure")
  val ListIDError = CountMetric("email-list-id-error", "Invalid list ID in email subscription")
}

trait CloudWatchApplicationMetrics extends GlobalSettings with Logging {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension = List(new Dimension().withName("ApplicationName").withValue(applicationName))

  def applicationName: String
  def applicationMetrics: List[FrontendMetric] = List(
    RequestMetrics.PanicRequestsSurgeMetric,
    RequestMetrics.PanicExcessiveLatencyMetric,
    RequestMetrics.PanicLatencyWarningMetric
  )

  def systemMetrics: List[FrontendMetric] = List(
    SystemMetrics.MaxHeapMemoryMetric,
    SystemMetrics.UsedHeapMemoryMetric,
    SystemMetrics.TotalPhysicalMemoryMetric,
    SystemMetrics.FreePhysicalMemoryMetric,
    SystemMetrics.BuildNumberMetric,
    SystemMetrics.FreeDiskSpaceMetric,
    SystemMetrics.ThreadCountMetric
  ) ++ SystemMetrics.garbageCollectors.flatMap{ gc => List(
      GaugeMetric(s"${gc.name}-gc-count-per-min" , "Used heap memory (MB)",
        StandardUnit.Count,
        () => gc.gcCount.toLong
      ),
      GaugeMetric(s"${gc.name}-gc-time-per-min", "Used heap memory (MB)",
        StandardUnit.Count,
        () => gc.gcTime.toLong
      )
    )}

  private def report() {
    val allMetrics: List[FrontendMetric] = this.systemMetrics ::: this.applicationMetrics

    CloudWatch.putMetrics(applicationMetricsNamespace, allMetrics, applicationDimension)
  }

  override def onStart(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)
    //run every minute, 36 seconds after the minute
    Jobs.schedule("ApplicationSystemMetricsJob", "36 * * * * ?"){
      report()
    }

    // Log heap usage every 5 seconds.
    if (Configuration.environment.isProd) {
      Jobs.scheduleEveryNSeconds("LogMetricsJob", 5) {
        val heapUsed = bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed)
        log.info(s"heap used: ${heapUsed}Mb")
        Future.successful(())
      }
    }

    // Log the build number and revision number on startup.
    log.info(s"Build number: ${ManifestData.build}, vcs revision: ${ManifestData.revision}")
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    if (Configuration.environment.isProd) {
      Jobs.deschedule("LogMetricsJob")
    }
    super.onStop(app)
  }

}

object bytesAsMb {
  // divide by 1048576 to convert bytes to MB
  def apply(bytes: Long): Long = bytes / 1048576
}
