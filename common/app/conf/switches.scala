package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import play.api.Plugin
import play.api.libs.ws.WS
import scala.concurrent.duration._

object Switches {

  // Switch names can be letters numbers and hyphens only

  val AutoRefreshSwitch = DefaultSwitch("auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    initiallyOn = true)

  val FontSwitch = DefaultSwitch("web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    initiallyOn = true)

  val FontDelaySwitch = DefaultSwitch("web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    initiallyOn = false)

  val AudienceScienceSwitch = DefaultSwitch("audience-science",
    "If this switch is on the Audience Science will be enabled.",
    initiallyOn = true)

  val DoubleCacheTimesSwitch = DefaultSwitch("double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    initiallyOn = false)

  val RelatedContentSwitch = DefaultSwitch("related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    initiallyOn = true)

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
    "Enable the social media share icons (Facebook, Twitter etc.)",
    initiallyOn = false)

  val SearchSwitch = DefaultSwitch("google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    initiallyOn = false)

  val QuantcastSwitch = DefaultSwitch("quantcast",
    "Enable the Quantcast audience segment tracking.",
    initiallyOn = false)

  val HomescreenSwitch = DefaultSwitch("homescreen",
    "If this switch is enabled the add-to-homescreen popup will plague iOS users.",
    initiallyOn = false)

  val AdvertSwitch = DefaultSwitch("adverts",
    "If this switch is on then OAS adverts will be loaded with JavaScript.",
    initiallyOn = true)

  val VideoAdvertSwitch = DefaultSwitch("video-adverts",
    "If this switch is on then OAS video adverts will be loaded with JavaScript.",
    initiallyOn = false)

  val ImageServerSwitch = DefaultSwitch("image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    initiallyOn = false)

  val SwipeNav = DefaultSwitch("swipe-nav",
    "If this switch is on then swipe navigation is enabled.",
    initiallyOn = false)

  val SwipeNavOnClick = DefaultSwitch("swipe-nav-on-click",
    "If this switch is also on then swipe navigation on clicks is enabled.",
    initiallyOn = false)

  val ABStoryArticleSwapV2 = DefaultSwitch("ab-story-article-swap-v2",
    "If this switch is on, swaps the latest article in a story for the story.",
    initiallyOn = false)

  val DiscussionSwitch = DefaultSwitch("discussion",
    "If this switch is on, comments are displayed on articles.",
    initiallyOn = false)

  val ShortDiscussionSwitch = DefaultSwitch("short-discussion",
    "If this switch is on, only 10 top level comments are requested from discussion api.",
    initiallyOn = true)

  val StoryArticleSwap = DefaultSwitch("story-article-swap",
    "If this switch is on, for the latest story, swaps it in in place of the latest article in that story. Confused?",
    initiallyOn = false)

  val AustraliaFrontSwitch = DefaultSwitch("australia-front",
    "If this switch is on the australia front will be available. Otherwise it will 404.",
    initiallyOn = false)

  val IntegrationTestSwitch = DefaultSwitch("integration-test-switch",
    "Switch that is only used while running tests. You never need to change this switch.",
    initiallyOn = false)

  val all: Seq[DefaultSwitch] = Seq(
    AudienceScienceSwitch,
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    FontDelaySwitch,
    FontSwitch,
    RelatedContentSwitch,
    SearchSwitch,
    NetworkFrontAppealSwitch,
    WitnessVideoSwitch,
    ExperimentStoryModule01Switch,
    StoryFrontTrails,
    SocialSwitch,
    QuantcastSwitch,
    IntegrationTestSwitch,
    StoryVersionBSwitch,
    HomescreenSwitch,
    ImageServerSwitch,
    AdvertSwitch,
    VideoAdvertSwitch,
    SwipeNav,
    SwipeNavOnClick,
    AustraliaFrontSwitch,
    ABStoryArticleSwapV2,
    DiscussionSwitch,
    ShortDiscussionSwitch,
    StoryArticleSwap
  )
}

class SwitchBoardAgent(config: GuardianConfiguration, val switches: Seq[Switchable]) extends AkkaSupport with Logging with Plugin {

  private lazy val schedule = play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
    refresh()
  }

  def refresh() {
    log.info("Refreshing switches")
    WS.url(config.switches.configurationUrl).get() foreach { response =>
      response.status match {
        case 200 =>
          val properties = Properties(response.body)
          for (switch <- switches) {
            properties.get(switch.name) foreach {
              case "on" => switch.switchOn()
              case "off" => switch.switchOff()
              case other => log.warn(s"Badly configured switch ${switch.name} -> $other")
            }
          }
        case _ => log.warn(s"Could not load switch config ${response.status} ${response.statusText}")
      }
    }
  }

  override def onStart() { schedule }
  override def onStop() { schedule.cancel() }
}
