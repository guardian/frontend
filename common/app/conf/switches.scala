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
import play.api.libs.ws.{Response, WS}

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

  val SearchSwitch = DefaultSwitch("google-search",
    "If this switch is turned on then Google search is added to the sections nav",
    initiallyOn = false)

  val QuantcastSwitch = DefaultSwitch("quantcast",
    "If this switch is enabled the Quantcast audience segment web bug will be embedded in all responses",
    initiallyOn = false)

  val HomescreenSwitch = DefaultSwitch("homescreen",
    "If this switch is enabled the add-to-homescreen popup will plague iOS users",
    initiallyOn = false)

  val OptimizelySwitch = DefaultSwitch("optimizely",
    "If this switch is on Optimizely will be enabled.",
    initiallyOn = false)

  val AdvertSwitch = DefaultSwitch("adverts",
    "If this switch is on OAS adverts will be enabled.",
    initiallyOn = true)

  val VideoAdvertSwitch = DefaultSwitch("video-adverts",
    "If this switch is on OAS video adverts will be enabled.",
    initiallyOn = true)

  val ABRelatedContentV2 = DefaultSwitch("ab-related-content-v2",
    "If this switch is on related content AB test will be enabled.",
    initiallyOn = false)
  
  val ImageServerSwitch = DefaultSwitch("image-server",
    "If this switch is on then i.guim.co.uk serve as our image host. Otherwise, images will come from static.guim.co.uk",
    initiallyOn = false)
  
  val all: Seq[Switchable] = Seq(
    FontSwitch, AutoRefreshSwitch, AudienceScienceSwitch, DoubleCacheTimesSwitch,
    RelatedContentSwitch, OmnitureVerificationSwitch, NetworkFrontAppealSwitch,
    ExperimentStoryModule01Switch, StoryVersionBSwitch, StoryFrontTrails, SocialSwitch,
    SearchSwitch, QuantcastSwitch, HomescreenSwitch, OptimizelySwitch, AdvertSwitch,
    VideoAdvertSwitch, ImageServerSwitch, ABRelatedContentV2
  )
}

class SwitchBoardAgent(config: GuardianConfiguration, val switches: Seq[Switchable]) extends AkkaSupport with Logging with Plugin {

  import play.api.libs.concurrent.Execution.Implicits._

  val configUrl = config.switches.configurationUrl

  private lazy val schedule = play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
    refresh()
  }

  def refresh() {
    log.info("Refreshing switches")
    WS.url(configUrl).get().foreach{ response =>
      response.status match {
        case 200 =>
          val properties = new Properties()
          properties.load(IOUtils.toInputStream(response.body))
          switches.foreach { switch =>
            Option(properties.getProperty(switch.name)).map {
              case "on" => switch.switchOn()
              case "off" => switch.switchOff()
              case other => log.warn(s"Badly configured switch ${switch.name} -> $other")
            }
          }
        case _ => log.warn(s"Could not load switch config ${response.status} ${response.statusText}")
      }
    }
  }

  override def onStart() = schedule

  override def onStop() = schedule.cancel()
}
