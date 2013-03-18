package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import org.apache.commons.io.IOUtils
import java.util.Properties
import play.api.Plugin
import akka.actor.Cancellable
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._
import play.api.{ Application => PlayApp }
import com.gu.management.play.RequestMetrics

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

  val RelatedContentSwitch = DefaultSwitch("related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    initiallyOn = true)

  val OmnitureVerificationSwitch = DefaultSwitch("omniture-verification",
    "If this switch is turned on then a separate call to Omniture will be made to help verify our tracking.",
    initiallyOn = false)

  val NetworkFrontAppealSwitch = DefaultSwitch("network-front-appeal",
    "Switch to show the appeal trailblock on the network front.",
    initiallyOn = false)

  val WitnessVideoSwitch = DefaultSwitch("witness-video",
    "Switch this switch off to disable witness video embeds.",
    initiallyOn = true)

  val ExperimentStoryModule01Switch = DefaultSwitch("experiment-story-module-01",
    "Enable storified articles.",
    initiallyOn = false)

  val StoryVersionBSwitch = DefaultSwitch("story-version-b",
    "Switch to enable version B of story page.",
    initiallyOn = false)

  val StoryFrontTrails = DefaultSwitch("story-front-trails",
    "Switch on to enable front trails for latest stories.",
    initiallyOn = false)

  val SocialSwitch = DefaultSwitch("social-icons",
    "If this switch is enabled the icons to popular social media sites will be displayed",
    initiallyOn = false)

  val QuantcastSwitch = DefaultSwitch("quantcast",
    "If this switch is enabled the Quantcast audience segment web bug will be embedded in all responses",
    initiallyOn = false)

  val all: Seq[Switchable] = Seq(
    FontSwitch, AutoRefreshSwitch, AudienceScienceSwitch, DoubleCacheTimesSwitch,
    RelatedContentSwitch, OmnitureVerificationSwitch, NetworkFrontAppealSwitch,
    ExperimentStoryModule01Switch, StoryVersionBSwitch, StoryFrontTrails, SocialSwitch,
    QuantcastSwitch
  )
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
