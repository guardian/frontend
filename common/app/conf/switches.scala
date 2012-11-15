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

  val AutoRefreshSwitch = DefaultSwitch("auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    initiallyOn = true)

  val FontSwitch = DefaultSwitch("web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    initiallyOn = true)

  val AudienceScienceSwitch = DefaultSwitch("audience-science",
    "If this switch is on the Audience Science will be enabled.",
    initiallyOn = true)

  val DoubleCacheTimesSwitch = DefaultSwitch("double-cache-times",
    "If this switch is turned on it doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    initiallyOn = false)

  val all: Seq[Switchable] = Seq(FontSwitch, AutoRefreshSwitch, AudienceScienceSwitch, DoubleCacheTimesSwitch)
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
