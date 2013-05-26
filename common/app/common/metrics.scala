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



case class DispatchStats(connectionPoolSize: Int, openChannels: Int)

object CommonMetrics {
  lazy val all = RequestMeasurementMetrics.asMetrics ++ AkkaMetrics.all ++ SystemMetrics.all
}
