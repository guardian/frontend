package common

import com.gu.management._
import conf.RequestMeasurementMetrics
import java.lang.management.ManagementFactory

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

object CommonApplicationMetrics {
  object SwitchBoardLoadTimingMetric extends TimingMetric(
    "switchboard",
    "switchboard-load",
    "Switchboard load timing",
    "Time spent running switchboard load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(SwitchBoardLoadTimingMetric)
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

object DiagnosticsMetrics {
  object DiagnosticsLoadTimingMetric extends TimingMetric(
    "diagnostics",
    "diagnostics-load",
    "Diagnostics load timing",
    "Time spent running diagnostics load jobs",
    None
  ) with TimingMetricLogging
}

object PorterMetrics {
  object AnalyticsLoadTimingMetric extends TimingMetric(
    "porter",
    "porter-analytics-load",
    "Porter analytics load timing",
    "Time spent running analytics load jobs",
    None
  ) with TimingMetricLogging

  object FastlyCloudwatchLoadTimingMetric extends TimingMetric(
    "porter",
    "porter-fastly-cloudwatch-load",
    "Porter Fastly to Cloudwatch load timing",
    "Time spent running Fastly to Cloudwatch statistics load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(AnalyticsLoadTimingMetric, FastlyCloudwatchLoadTimingMetric)
}

object CoreNavigationMetrics {
  object MostPopularLoadTimingMetric extends TimingMetric(
    "core-nav",
    "core-nav-most-popular-load",
    "Core Navigation Most Popular load timing",
    "Time spent running most popular data load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(MostPopularLoadTimingMetric)
}

object FrontMetrics {
  object FrontLoadTimingMetric extends TimingMetric(
    "front",
    "front-load",
    "Front load timing",
    "Time spent running front data load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(FrontLoadTimingMetric)
}

object FootballMetrics {
  object MatchDayLoadTimingMetric extends TimingMetric(
    "football",
    "football-matchday-load",
    "Football match day load timing",
    "Time spent running football match day data load jobs",
    None
  ) with TimingMetricLogging

  object CompetitionLoadTimingMetric extends TimingMetric(
    "football",
    "football-competition-load",
    "Football competition load timing",
    "Time spent running competition data load jobs",
    None
  ) with TimingMetricLogging

  object CompetitionAgentLoadTimingMetric extends TimingMetric(
    "football",
    "football-competition-agent-load",
    "Football competition agent load timing",
    "Time spent running competition agent data load jobs",
    None
  ) with TimingMetricLogging

  object LiveBlogRefreshTimingMetric extends TimingMetric(
    "football",
    "football-live-blog-refresh",
    "Football live blog refresh timing",
    "Time spent running live blog refresh jobs",
    None
  ) with TimingMetricLogging

  object TeamTagMappingsRefreshTimingMetric extends TimingMetric(
    "football",
    "football-team-tag-refresh",
    "Football team tag mappings refresh timing",
    "Time spent running team tag mapping refresh jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(
    MatchDayLoadTimingMetric, CompetitionLoadTimingMetric,
    CompetitionAgentLoadTimingMetric, LiveBlogRefreshTimingMetric,
    TeamTagMappingsRefreshTimingMetric
  )
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

object CommercialMetrics {

  object TravelOffersLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-travel-offers-load",
    "Commercial Travel Offers load timing",
    "Time spent running travel offers data load jobs",
    None
  ) with TimingMetricLogging

  object JobsLoadTimingMetric extends TimingMetric(
    "commercial",
    "commercial-jobs-load",
    "Commercial Jobs load timing",
    "Time spent running job ad data load jobs",
    None
  ) with TimingMetricLogging

  val all: Seq[Metric] = Seq(TravelOffersLoadTimingMetric, JobsLoadTimingMetric)
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
  lazy val common = RequestMeasurementMetrics.asMetrics ++ SystemMetrics.all ++ CommonApplicationMetrics.all

  lazy val contentApi = ContentApiMetrics.all
  lazy val pa = PaMetrics.all

  lazy val discussion = DiscussionMetrics.all
  lazy val admin = AdminMetrics.all
  lazy val facia = FaciaMetrics.all
  lazy val faciaTool = FaciaToolMetrics.all
  lazy val porter = PorterMetrics.all
  lazy val coreNavigation = CoreNavigationMetrics.all
  lazy val front = FrontMetrics.all
  lazy val football = FootballMetrics.all
  lazy val commercial = CommercialMetrics.all
}
