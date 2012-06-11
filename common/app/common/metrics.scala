package common

import akka.dispatch.{ MessageDispatcher, Dispatcher }
import com.gu.management.{ TextMetric, GaugeMetric, CountMetric, TimingMetric }

object RequestMetrics {
  object RequestTimingMetric extends TimingMetric(
    "performance",
    "requests",
    "Client requests",
    "incoming requests to the application"
  )

  object Request200s extends CountMetric("request-status", "200_ok", "200 Ok", "number of pages that responded 200")
  object Request50xs extends CountMetric("request-status", "50x_error", "50x Error", "number of pages that responded 50x")
  object Request404s extends CountMetric("request-status", "404_not_found", "404 Not found", "number of pages that responded 404")
  object Request30xs extends CountMetric("request-status", "30x_redirect", "30x Redirect", "number of pages that responded with a redirect")
  object RequestOther extends CountMetric("request-status", "other", "Other", "number of pages that responded with an unexpected status code")

  val all = Seq(RequestTimingMetric, Request200s, Request50xs, Request404s, RequestOther, Request30xs)
}

object ContentApiMetrics {
  object ContentApiHttpTimingMetric extends TimingMetric(
    "performance",
    "content-api-calls",
    "Content API calls",
    "outgoing requests to content api",
    Some(RequestMetrics.RequestTimingMetric)
  )

  val all = Seq(ContentApiHttpTimingMetric)
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

  object Uptime extends GaugeMetric("akka", "akka_uptime", "Akka Uptime", "Akka system uptime in seconds", () => akka.uptime())

  object ActionsDispatcherInhabitants extends DispatcherInhabitantsMetric("actions_dispatcher", akka.dispatcher.actions)
  object ActionsDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("actions_dispatcher", akka.dispatcher.actions)
  object ActionsDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("actions_dispatcher", akka.dispatcher.actions)

  object PromisesDispatcherInhabitants extends DispatcherInhabitantsMetric("promises_dispatcher", akka.dispatcher.promises)
  object PromisesDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("promises_dispatcher", akka.dispatcher.promises)
  object PromisesDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("promises_dispatcher", akka.dispatcher.promises)

  object WebsocketsDispatcherInhabitants extends DispatcherInhabitantsMetric("websockets_dispatcher", akka.dispatcher.websockets)
  object WebsocketsDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("websockets_dispatcher", akka.dispatcher.websockets)
  object WebsocketsDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("websockets_dispatcher", akka.dispatcher.websockets)

  object DefaultDispatcherInhabitants extends DispatcherInhabitantsMetric("default_dispatcher", akka.dispatcher.default)
  object DefaultDispatcherMailBoxType extends DispatcherMailBoxTypeMetric("default_dispatcher", akka.dispatcher.default)
  object DefaultDispatcherMaximumThroughput extends DispatcherMaximumThroughputMetric("default_dispatcher", akka.dispatcher.default)

  val all = Seq(
    Uptime,
    ActionsDispatcherInhabitants, ActionsDispatcherMailBoxType, ActionsDispatcherMaximumThroughput,
    PromisesDispatcherInhabitants, PromisesDispatcherMailBoxType, PromisesDispatcherMaximumThroughput,
    WebsocketsDispatcherInhabitants, WebsocketsDispatcherMailBoxType, WebsocketsDispatcherMaximumThroughput,
    DefaultDispatcherInhabitants, DefaultDispatcherMailBoxType, DefaultDispatcherMaximumThroughput
  )
}

object CommonMetrics {
  lazy val all = ContentApiMetrics.all ++ RequestMetrics.all ++ AkkaMetrics.all
}