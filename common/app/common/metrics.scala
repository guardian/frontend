package common

import akka.dispatch.Dispatcher
import com.gu.management._
import conf.RequestMeasurementMetrics
import scala.Some
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

object AkkaMetrics extends AkkaSupport {

  class DispatcherInhabitantsMetric(name: String, dispatcher: Dispatcher) extends GaugeMetric(
    "akka",
    "akka_%s_inhabitants" format name,
    "%s inhabitants" format name,
    "Akka %s inhabitants" format name,
    () => dispatcher.inhabitants
  )

  class DispatcherMailBoxTypeMetric(name: String, dispatcher: Dispatcher) extends TextMetric(
    "akka",
    "akka_%s_mailbox_type" format name,
    "%s mailbox type" format name,
    "Akka %s mailbox type" format name,
    () => dispatcher match {
      case downcast: Dispatcher => downcast.mailboxType.getClass.getSimpleName
      case _ => "Not an akka.dispatch.Dispatcher: Cannot determine mailbox type"
    }
  )

  class DispatcherMaximumThroughputMetric(name: String, dispatcher: Dispatcher) extends GaugeMetric(
    "akka",
    "akka_%s_maximum_throughput" format name,
    "%s maximum throughput" format name,
    "Akka %s maximum throughput" format name,
    () => dispatcher.throughput
  )

  object Uptime extends GaugeMetric("akka", "akka_uptime", "Akka Uptime", "Akka system uptime in seconds", () => play_akka.uptime())

  val dispatcher = executionContext.asInstanceOf[Dispatcher]

  object DefaultDispatcherInhabitants extends DispatcherInhabitantsMetric("default_dispatcher", dispatcher)
  object DefaultDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("default_dispatcher", dispatcher)
  object DefaultDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("default_dispatcher", dispatcher)

  val all = Seq(Uptime, DefaultDispatcherInhabitants, DefaultDispatcherMailBoxType, DefaultDispatcherMaximumThroughput)
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

  val all: Seq[Metric] = Seq(HttpTimingMetric, HttpTimeoutCountMetric)
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

object MongoMetrics {
  object MongoTimingMetric extends TimingMetric("performance", "database", "Mongo request", "outgoing Mongo calls")
  object MongoOkCount extends CountMetric("database-status", "ok", "Ok", "number of mongo requests successfully completed")
  object MongoErrorCount extends CountMetric("database-status", "error", "Error", "number of mongo requests that error")

  val all: Seq[Metric] = Seq(MongoTimingMetric, MongoOkCount, MongoErrorCount)
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

object AdminMetrics {
  object ConfigUpdateCounter extends CountMetric("actions", "config_updates", "Config updates", "number of times config was updated")
  object ConfigUpdateErrorCounter extends CountMetric("actions", "config_update_errors", "Config update errors", "number of times config update failed")

  object SwitchesUpdateCounter extends CountMetric("actions", "switches_updates", "Switches updates", "number of times switches was updated")
  object SwitchesUpdateErrorCounter extends CountMetric("actions", "switches_update_errors", "Switches update errors", "number of times switches update failed")

  val all = Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter, SwitchesUpdateCounter, SwitchesUpdateErrorCounter)
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

//case class DispatchStats(connectionPoolSize: Int, openChannels: Int)

object Metrics {
  lazy val common = RequestMeasurementMetrics.asMetrics ++ AkkaMetrics.all ++ SystemMetrics.all
  lazy val contentApi = ContentApiMetrics.all
  lazy val discussion = DiscussionMetrics.all
  lazy val mongo = MongoMetrics.all
  lazy val pa = PaMetrics.all
  lazy val admin = AdminMetrics.all
  lazy val porter = PorterMetrics.all
}
