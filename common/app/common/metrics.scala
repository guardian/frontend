package common

import play.api.libs.ws.WS
import akka.dispatch.{ MessageDispatcher, Dispatcher }
import com.gu.management._
import conf.RequestMeasurementMetrics
import com.ning.http.client.providers.netty.NettyConnectionsPool
import org.jboss.netty.channel.group.DefaultChannelGroup
import scala.Some
import contentapi.DispatchHttp

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

  class DispatcherInhabitantsMetric(name: String, dispatcher: MessageDispatcher) extends GaugeMetric(
    "akka",
    "akka_%s_inhabitants" format name,
    "%s inhabitants" format name,
    "Akka %s inhabitants" format name,
    () => dispatcher.inhabitants
  )

  class DispatcherMailBoxTypeMetric(name: String, dispatcher: MessageDispatcher) extends TextMetric(
    "akka",
    "akka_%s_mailbox_type" format name,
    "%s mailbox type" format name,
    "Akka %s mailbox type" format name,
    () => dispatcher match {
      case downcast: Dispatcher => downcast.mailboxType.getClass.getSimpleName
      case _ => "Not an akka.dispatch.Dispatcher: Cannot determine mailbox type"
    }
  )

  class DispatcherMaximumThroughputMetric(name: String, dispatcher: MessageDispatcher) extends GaugeMetric(
    "akka",
    "akka_%s_maximum_throughput" format name,
    "%s maximum throughput" format name,
    "Akka %s maximum throughput" format name,
    () => dispatcher match {
      case downcast: Dispatcher => downcast.throughput
      case _ => 0
    }
  )

  object Uptime extends GaugeMetric("akka", "akka_uptime", "Akka Uptime", "Akka system uptime in seconds", () => play_akka.uptime())

  object DefaultDispatcherInhabitants extends DispatcherInhabitantsMetric("default_dispatcher", play_akka.dispatcher.default)
  object DefaultDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("default_dispatcher", play_akka.dispatcher.default)
  object DefaultDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("default_dispatcher", play_akka.dispatcher.default)

  val all = Seq(Uptime, DefaultDispatcherInhabitants, DefaultDispatcherMailBoxType, DefaultDispatcherMaximumThroughput)
}

abstract class WsMetric(
    val group: String, val name: String, val title: String, val description: String,
    override val master: Option[Metric] = None) extends AbstractMetric[Int] {
  val `type`: String = "gauge"
  override def asJson: StatusMetric = super.asJson.copy(value = Some(getValue().toString))
}

case class DispatchStats(connectionPoolSize: Int, openChannels: Int)

object CommonMetrics {
  lazy val all = RequestMeasurementMetrics.asMetrics ++ AkkaMetrics.all
}
