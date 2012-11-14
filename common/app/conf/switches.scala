package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import org.apache.commons.io.IOUtils
import java.util.Properties
import play.api.Plugin
import akka.actor.Cancellable
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import play.api.{ Application => PlayApp }

object CommonSwitches {

  val FontSwitch = DefaultSwitch("font-family", "Enables web font loading")

  val PollingSwitch = DefaultSwitch("auto-refresh", "Disables polling across site")

  val AudienceScienceSwitch = DefaultSwitch("audience-science", "Disables Audience Science tracking")

  val DoubleCacheTimesSwitch = DefaultSwitch("double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    initiallyOn = false)

  val all: Seq[Switchable] = Seq(FontSwitch, PollingSwitch, AudienceScienceSwitch, DoubleCacheTimesSwitch)

}

class SwitchBoardAgent(config: GuardianConfiguration, val switches: Seq[Switchable]) extends AkkaSupport with Logging with HttpSupport with Plugin {

  val configUrl = config.switches.configurationUrl

  override val proxy = Proxy(config)

  private var schedule: Option[Cancellable] = None

  def refresh() {
    log.info("Refreshing switches")
    loadConfig.foreach { config =>
      val properties = new Properties()
      properties.load(IOUtils.toInputStream(config))
      switches.foreach { switch =>
        Option(properties.getProperty(switch.name)).map {
          case "on" => switch.switchOn()
          case "off" => switch.switchOff()
          case other => log.warn("Badly configured switch %s -> %s" format (switch.name, other))
        }
      }
    }
  }

  private def loadConfig: Option[String] = http.GET(configUrl) match {
    case Response(200, body, _) => Some(body)
    case Response(error, _, status) =>
      log.warn("Could not load switch config %s %s" format (error, status))
      None
  }

  override def onStart() = schedule = Some(play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
    refresh()
  })

  override def onStop() = schedule.foreach(_.cancel())
}
