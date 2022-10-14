package common

import java.io.File
import java.lang.management.{GarbageCollectorMXBean, ManagementFactory}
import java.util.concurrent.atomic.AtomicLong

import app.LifecycleComponent
import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit}
import conf.Configuration
import metrics._
import model.ApplicationIdentity
import model.diagnostics.CloudWatch
import play.api.inject.ApplicationLifecycle

import scala.jdk.CollectionConverters._
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

object SystemMetrics extends implicits.Numbers {

  class GcRateMetric(bean: GarbageCollectorMXBean) {
    private val lastGcCount = new AtomicLong(0)
    private val lastGcTime = new AtomicLong(0)

    lazy val name = bean.getName.replace(" ", "_")

    def gcCount: Double = {
      val totalGcCount = bean.getCollectionCount
      totalGcCount - lastGcCount.getAndSet(totalGcCount).toDouble
    }

    def gcTime: Double = {
      val totalGcTime = bean.getCollectionTime
      totalGcTime - lastGcTime.getAndSet(totalGcTime).toDouble
    }
  }

  lazy val garbageCollectors: Seq[GcRateMetric] =
    ManagementFactory.getGarbageCollectorMXBeans.asScala.map(new GcRateMetric(_)).toSeq

  val MaxHeapMemoryMetric = GaugeMetric(
    name = "max-heap-memory",
    description = "Max heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getMax),
  )

  val UsedHeapMemoryMetric = GaugeMetric(
    name = "used-heap-memory",
    description = "Used heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed),
  )

  val MaxNonHeapMemoryMetric = GaugeMetric(
    name = "max-non-heap-memory",
    description = "Max non heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getMax),
  )

  val UsedNonHeapMemoryMetric = GaugeMetric(
    name = "used-non-heap-memory",
    description = "Used non heap memory (MB)",
    get = () => bytesAsMb(ManagementFactory.getMemoryMXBean.getNonHeapMemoryUsage.getUsed),
  )

  val FreeDiskSpaceMetric = GaugeMetric(
    name = "free-disk-space",
    description = "Free disk space (MB)",
    get = () => bytesAsMb(new File("/").getUsableSpace),
  )

  val ThreadCountMetric = GaugeMetric(
    name = "thread-count",
    description = "Thread Count",
    get = () => ManagementFactory.getThreadMXBean.getThreadCount,
    metricUnit = StandardUnit.Count,
  )

  // yeah, casting to com.sun.. ain't too pretty
  val TotalPhysicalMemoryMetric = GaugeMetric(
    name = "total-physical-memory",
    description = "Total physical memory",
    get = () =>
      ManagementFactory.getOperatingSystemMXBean match {
        case b: com.sun.management.OperatingSystemMXBean => bytesAsMb(b.getTotalPhysicalMemorySize)
        case _                                           => -1
      },
  )

  val FreePhysicalMemoryMetric = GaugeMetric(
    name = "free-physical-memory",
    description = "Free physical memory",
    get = () =>
      ManagementFactory.getOperatingSystemMXBean match {
        case b: com.sun.management.OperatingSystemMXBean => bytesAsMb(b.getFreePhysicalMemorySize)
        case _                                           => -1
      },
  )

  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _                      => -1 // dev machines do not have a build number
  }

  val BuildNumberMetric = GaugeMetric(
    name = "build-number",
    description = "Build number",
    get = () => buildNumber,
    metricUnit = StandardUnit.None,
  )

}

object ContentApiMetrics {
  val HttpLatencyTimingMetric = TimingMetric(
    "content-api-call-latency",
    "Content api call latency",
  )

  val HttpTimeoutCountMetric = CountMetric(
    "content-api-timeouts",
    "Content api calls that timeout",
  )

  val ContentApiErrorMetric = CountMetric(
    "content-api-errors",
    "Number of times the Content API returns errors (not counting when circuit breaker is on)",
  )

  val ContentApi404Metric = CountMetric(
    "content-api-404",
    "Number of times the Content API has responded with a 404",
  )

  val ContentApiRequestsMetric = CountMetric(
    "content-api-requests",
    "Number of times the Content API has been called",
  )

}

object FaciaPressMetrics {
  val FrontPressCronSuccess = CountMetric(
    "front-press-cron-success",
    "Number of times facia-tool cron job has successfully pressed",
  )

  val UkPressLatencyMetric = DurationMetric("uk-press-latency", StandardUnit.Milliseconds)
  val UsPressLatencyMetric = DurationMetric("us-press-latency", StandardUnit.Milliseconds)
  val AuPressLatencyMetric = DurationMetric("au-press-latency", StandardUnit.Milliseconds)
  val AllFrontsPressLatencyMetric = DurationMetric("front-press-latency", StandardUnit.Milliseconds)
  val FrontPressContentSize = SamplerMetric("front-press-content-size", StandardUnit.Bytes)
  val FrontPressContentSizeLite = SamplerMetric("front-press-content-size-lite", StandardUnit.Bytes)
  val FrontDecodingLatency = DurationMetric("front-decoding-latency", StandardUnit.Milliseconds)
  val FrontDownloadLatency = DurationMetric("front-download-latency", StandardUnit.Milliseconds)
}

object EmailSubsciptionMetrics {
  val AllEmailSubmission = CountMetric("all-email-submission", "Any request to the submit email endpoint")
  val EmailSubmission = CountMetric("email-submission", "Successful POST to the email API Gateway")
  val NotAccepted = CountMetric("email-submission-not-accepted", "Any request with the wrong MIME type")
  val EmailFormError = CountMetric("email-submission-form-error", "Email submission form error")
  val APIHTTPError = CountMetric("email-api-http-error", "Non-200/201 response from email subscription API")
  val APINetworkError = CountMetric("email-api-network-error", "Email subscription API network failure")
  val ListIDError = CountMetric("email-list-id-error", "Invalid list ID in email subscription")
  val RecaptchaMissingTokenError = CountMetric("email-recaptcha-missing-token-failure", "Recaptcha missing token error")
  val RecaptchaValidationError = CountMetric("email-recaptcha-validation-failure", "Recaptcha validation error")
  val RecaptchaAPIUnavailableError =
    CountMetric("email-recaptcha-api-unavailable-failure", "Recaptcha API unavailable error")
  val RecaptchaValidationSuccess = CountMetric("email-recaptcha-validation-success", "Recaptcha validation success")
}

case class ApplicationMetrics(metrics: List[FrontendMetric])

object ApplicationMetrics {
  def apply(metrics: FrontendMetric*): ApplicationMetrics = ApplicationMetrics(metrics.toList)
}

object DCRMetrics {
  val DCRLatencyMetric = TimingMetric(
    "dcr-latency",
    "DCR response time",
  )

  val DCRRequestCountMetric = CountMetric(
    "dcr-request-count",
    "DCR request count",
  )
}
class CloudWatchMetricsLifecycle(
    appLifecycle: ApplicationLifecycle,
    appIdentity: ApplicationIdentity,
    appMetrics: ApplicationMetrics = ApplicationMetrics(Nil),
    jobs: JobScheduler,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {
  val applicationMetricsNamespace: String = "Application"
  val applicationDimension = List(new Dimension().withName("ApplicationName").withValue(appIdentity.name))

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("ApplicationSystemMetricsJob")
      if (Configuration.environment.isProd) {
        jobs.deschedule("LogMetricsJob")
      }
    }
  }

  def systemMetrics: List[FrontendMetric] =
    List(
      SystemMetrics.MaxHeapMemoryMetric,
      SystemMetrics.UsedHeapMemoryMetric,
      SystemMetrics.TotalPhysicalMemoryMetric,
      SystemMetrics.FreePhysicalMemoryMetric,
      SystemMetrics.BuildNumberMetric,
      SystemMetrics.FreeDiskSpaceMetric,
      SystemMetrics.ThreadCountMetric,
    ) ++ SystemMetrics.garbageCollectors.flatMap { gc =>
      List(
        GaugeMetric(
          s"${gc.name}-gc-count-per-min",
          "Used heap memory (MB)",
          StandardUnit.Count,
          () => gc.gcCount,
        ),
        GaugeMetric(
          s"${gc.name}-gc-time-per-min",
          "Used heap memory (MB)",
          StandardUnit.Count,
          () => gc.gcTime,
        ),
      )
    }

  private def report(): Unit = {
    val allMetrics: List[FrontendMetric] = this.systemMetrics ::: this.appMetrics.metrics

    CloudWatch.putMetrics(applicationMetricsNamespace, allMetrics, applicationDimension)
  }

  override def start(): Unit = {
    jobs.deschedule("ApplicationSystemMetricsJob")
    //run every minute, 36 seconds after the minute
    jobs.schedule("ApplicationSystemMetricsJob", "36 * * * * ?") {
      report()
    }

    // Log heap usage every 5 seconds.
    if (Configuration.environment.isProd) {
      jobs.scheduleEvery("LogMetricsJob", 5.seconds) {
        val heapUsed = bytesAsMb(ManagementFactory.getMemoryMXBean.getHeapMemoryUsage.getUsed)
        log.info(s"heap used: ${heapUsed}Mb")
        Future.successful(())
      }
    }

    // Log the build number and revision number on startup.
    log.info(s"Build number: ${ManifestData.build}, vcs revision: ${ManifestData.revision}")
  }
}

object bytesAsMb {
  // divide by 1048576 to convert bytes to MB
  def apply(bytes: Long): Double = (bytes / 1048576).toDouble
}
