package common

import play.api.{Application => PlayApp, Play, GlobalSettings}
import com.gu.management._
import conf.RequestMeasurementMetrics
import java.lang.management.ManagementFactory
import model.diagnostics.CloudWatch

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

  private lazy val buildNumber = ManifestData.build match {
    case string if string.isInt => string.toInt
    case _ => -1 // dev machines do not have a build number
  }

  object BuildNumberMetric extends GaugeMetric("application", "build-number", "Build number", "Build number",
    () => buildNumber
  )

  val all = Seq(MaxHeapMemoryMetric, UsedHeapMemoryMetric,
    MaxNonHeapMemoryMetric, UsedNonHeapMemoryMetric, BuildNumberMetric)
}

object ContentApiMetrics {
  object HttpTimingMetric extends TimingMetric(
    "performance",
    "content-api-calls",
    "Content API calls",
    "outgoing requests to content api"
  ) with TimingMetricLogging

  object HttpTimeoutCountMetric extends CountMetric(
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

  object ElasticHttpTimeoutCountMetric extends CountMetric(
    "timeout",
    "elastic-content-api-timeouts",
    "Elastic Content API timeouts",
    "Elastic Content api calls that timeout"
  )

  val all: Seq[Metric] = Seq(
    HttpTimingMetric,
    HttpTimeoutCountMetric,
    ElasticHttpTimeoutCountMetric,
    ElasticHttpTimingMetric
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

  object JsonParsingErrorCount extends CountMetric(
    "facia-front",
    "facia-json-error",
    "Facia JSON parsing errors",
    "Number of errors whilst parsing JSON out of S3"
  )

  val all: Seq[Metric] = Seq(
    JsonParsingErrorCount
  )
}

object FaciaToolMetrics {

  object ApiUsageCount extends CountMetric(
    "facia-api",
    "facia-api-usage",
    "Facia API usage count",
    "Number of requests to the Facia API from clients (The tool)"
  )

  object ProxyCount extends CountMetric(
    "facia-api",
    "facia-proxy-usage",
    "Facia proxy usage count",
    "Number of requests to the Facia proxy endpoints (Ophan and Content API) from clients"
  )

  object ExpiredRequestCount extends CountMetric(
    "facia-api",
    "facia-auth-expired",
    "Facia auth endpoints expired requests",
    "Number of expired requests coming into an endpoint using ExpiringAuthAction"
  )

  object DraftPublishCount extends CountMetric(
    "facia-api",
    "facia-draft-publish",
    "Facia draft publish count",
    "Number of drafts that have been published"
  )

  val all: Seq[Metric] = Seq(
    ApiUsageCount, ProxyCount, ExpiredRequestCount,
    DraftPublishCount
  )
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

trait CloudWatchApplicationMetrics extends GlobalSettings {

  def applicationName: String

  def report() {

    val metrics = Map(
      s"$applicationName-max-heap-memory" -> SystemMetrics.MaxHeapMemoryMetric.getValue().toDouble,
      s"$applicationName-used-heap-memory" -> SystemMetrics.UsedHeapMemoryMetric.getValue().toDouble
    )

    CloudWatch.put("ApplicationSystemMetrics", metrics)
  }

  override def onStart(implicit app: PlayApp) {
    Jobs.deschedule("ApplicationSystemMetricsJob")
    super.onStart(app)

    // don't fire off metrics during test runs
    if (!Play.isTest) {
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
