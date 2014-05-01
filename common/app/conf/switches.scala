package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import implicits.Collections
import org.joda.time.{Days, DateTime, DateMidnight}
import play.api.libs.ws.WS
import play.api.{Application, Plugin}

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

case class Switch( group: String,
                   name: String,
                   description: String,
                   safeState: SwitchState,
                   sellByDate: DateMidnight
                 ) extends Switchable {

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn && new DateMidnight().isBefore(sellByDate)

  def switchOn() {
    if (isSwitchedOff) {
      delegate.switchOn()
    }
  }
  def switchOff() {
    if (isSwitchedOn) {
      delegate.switchOff()
    }
  }

  def daysToExpiry = Days.daysBetween(new DateTime(), sellByDate).getDays

  def expiresSoon = daysToExpiry < 7
}

object Switches extends Collections {

  // Switch names can be letters numbers and hyphens only

  private lazy val never = new DateMidnight(2100, 1, 1)

  // this is 3 months - at the end of this a decision is expected
  // and one (or both) of the 2 needs to go.
  private lazy val profilingEvalDeadline = new DateMidnight(2014, 6, 4)


  // Load Switches

  val MemcachedSwitch = Switch("Performance Switches", "memcached",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = Off,
    sellByDate = never
  )

  val IncludeBuildNumberInMemcachedKey = Switch("Performance Switches", "memcached-build-number",
    "If this switch is switched on then the MemcacheFilter will include the build number in the cache key",
    safeState = Off,
    sellByDate = never
  )

  val AutoRefreshSwitch = Switch("Performance Switches", "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off, sellByDate = never
  )

  val GzipSwitch = Switch("Performance Switches", "gzip",
    "If switched on then http responses will be gzipped",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 5)
  )

  val DoubleCacheTimesSwitch = Switch("Performance Switches", "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On, sellByDate = never
  )

  val RelatedContentSwitch = Switch("Performance Switches", "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On, sellByDate = never
  )

  val CssFromStorageSwitch = Switch("Performance Switches", "css-from-storage",
    "If this switch is on CSS will be cached in users localStorage and read from there on subsequent requests.",
    safeState = Off, sellByDate = never
  )

  val ElasticSearchSwitch = Switch("Performance Switches", "elastic-search-content-api",
    "If this switch is on then (parts of) the application will use the Elastic Search content api",
    safeState = On, sellByDate = never
  )

  val ShowAllArticleEmbedsSwitch = Switch("Performance Switches", "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On, sellByDate = never
  )

  val DiscussionSwitch = Switch("Performance Switches", "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = Off, sellByDate = never
  )

  val OpenCtaSwitch = Switch("Performance Switches", "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API is blowing up.",
    safeState = Off, sellByDate = never
  )

  // Advertising Switches

  val StandardAdvertsSwitch = Switch("Advertising", "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On, sellByDate = never
  )

  val CommercialComponentsSwitch = Switch("Advertising", "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    safeState = On, sellByDate = never
  )

  val VideoAdvertsSwitch = Switch("Advertising", "video-adverts",
    "Show adverts on videos.",
    safeState = On, sellByDate = never
  )

  val SponsoredSwitch = Switch("Advertising", "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On, sellByDate = never
  )

  // Ad Targeting
  /*
    These switches are to control length of request to DFP
    while there's a problem with the maximum length constraint
  */

  val AudienceScienceSwitch = Switch("Ad Targeting", "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off, sellByDate = new DateMidnight(2014, 11, 1))

  val AudienceScienceGatewaySwitch = Switch("Ad Targeting", "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off, sellByDate = new DateMidnight(2014, 11, 1))

  val CriteoSwitch = Switch("Ad Targeting", "criteo",
    "If this switch is on, Criteo segments will be used to target ads.",
    safeState = Off, sellByDate = new DateMidnight(2014, 11, 1))

  val LifeAndStyleHackSwitch = Switch("Ad Targeting", "life-and-style",
    "If this switch is on, ads will work on Life and Style front while waiting for fix from Front Tools team.",
    safeState = On, sellByDate = new DateMidnight(2014, 5, 14))

  // Commercial Tags

  val ImrWorldwideSwitch = Switch("Commercial Tags", "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off, sellByDate = profilingEvalDeadline)

  val EffectiveMeasureSwitch = Switch("Commercial Tags", "effective-measure",
    "Enable the Effective Measure audience segment tracking.",
    safeState = Off, sellByDate = profilingEvalDeadline)

  // We don't foresee this service being switched off
  val ForeseeSwitch = Switch("Performance Switches", "foresee",
    "Enable Foresee surveys for a sample of our audience",
    safeState = Off, sellByDate = never)

  val MediaMathSwitch = Switch("Commercial Tags", "media-math",
    "Enable Media Math audience segment tracking",
    safeState = Off, sellByDate = never)

  // Commercial Feeds

  val TravelOffersFeedSwitch = Switch("Performance Switches", "gu-travel-offers",
    "If this switch is on, commercial components will be fed by travel offer feed.",
    safeState = Off, sellByDate = never)

  val JobFeedSwitch = Switch("Performance Switches", "gu-jobs",
    "If this switch is on, commercial components will be fed by job feed.",
    safeState = Off, sellByDate = never)

  val MasterclassFeedSwitch = Switch("Performance Switches", "gu-masterclasses",
    "If this switch is on, commercial components will be fed by masterclass feed.",
    safeState = Off, sellByDate = never)

  val SoulmatesFeedSwitch = Switch("Performance Switches", "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off, sellByDate = never)

  val MoneysupermarketFeedsSwitch = Switch("Performance Switches", "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off, sellByDate = never)

  val LCMortgageFeedSwitch = Switch("Performance Switches", "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off, sellByDate = never)

  val GuBookshopFeedsSwitch = Switch("Performance Switches", "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off, sellByDate = never)


  // Analytics Switches

  val OphanSwitch = Switch("Analytics", "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On, never
  )

  val DiagnosticsLogging = Switch("Diagnostics", "enable-diagnostics-logging",
    "If this switch is on, then js error reports and requests sent to the Diagnostics servers will be logged.",
    safeState = Off, never
  )

  val ScrollDepthSwitch = Switch("Analytics", "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off, never
  )

  // Feature Switches

  val ReleaseMessageSwitch = Switch("Feature Switches", "release-message",
    "If this is switched on users will be messaged that they are inside the beta release",
    safeState = Off, sellByDate = new DateMidnight(2014, 6, 1)
  )

  val FontSwitch = Switch("Feature Switches", "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = Off, sellByDate = never
  )

  val SearchSwitch = Switch("Feature Switches", "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = Off, sellByDate = never
  )

  val IdentityProfileNavigationSwitch = Switch("Feature Switches", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On, sellByDate = never
  )

  val ClientSideErrorSwitch = Switch("Feature Switches", "client-side-errors",
    "If this is switch on the the browser will log JavaScript errors to the server (via a beacon)",
    safeState = Off, sellByDate = never
  )

  val FacebookAutoSigninSwitch = Switch("Feature Switches", "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not recently signed out are automatically signed in.",
    safeState = Off, sellByDate = never
  )

  val IdentityFormstackSwitch = Switch("Feature Switches", "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off, sellByDate = never
  )

  val IdentityAvatarUploadSwitch = Switch("Feature Switches", "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    safeState = Off, sellByDate = never
  )

  val IdentityEthicalAwardsSwitch = Switch("Feature Switches", "id-ethical-awards",
    "If this switch is on, Ethical awards forms will be available",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 15))

  val NetworkFrontOptIn = Switch("Feature Switches", "network-front-opt-in",
    "If this is switched on then an opt-in message will be displayed to users coming from the R2 network front",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 31)
  )

  val ArticleSlotsSwitch = Switch("Feature Switches", "article-slots",
    "If this switch is on, inline content slots (for stories, ads, etc) will be generated in article bodies",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 31)
  )

  val IndiaRegionSwitch = Switch("Feature Switches", "india-region",
    "If this switch is switched on then the India region will be enabled",
    safeState = Off,
    // I know this is far away, but this will lie dormant for a while (other than testing) while
    // the planets align for the rest of the project
    sellByDate = new DateMidnight(2014, 10, 30)
  )

  val LayoutHintsSwitch = Switch("Feature Switches", "layout-hints",
    "If this switch is on, JavaScript will enable the inline-hinting css experiments",
    safeState = Off, sellByDate = new DateMidnight(2014, 6, 1)
  )

  val RssLinkSwitch = Switch("Feature Switches", "rss-link",
    "If this switch is on a link to the RSS is rendered in the HTML",
    safeState = Off, sellByDate = new DateMidnight(2014, 6, 30)
  )

  val PopularInTagSwitch = Switch("Feature Switches", "popular-in-tag",
    "If this switch is turned on then popular-in-tag will override related content for the selected tags.",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 14)
  )

  val EnhanceTweetsSwitch = Switch("Feature Switches", "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    safeState = Off, sellByDate = never
  )

  // A/B Test Switches
  val ABHomeComponent = Switch("A/B Tests", "ab-home-component",
    "This switch runs an AB test which adds a sticky-like home button.",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 4)
  )

  // Dummy Switches

  val IntegrationTestSwitch = Switch("Unwired Test Switch", "integration-test-switch",
    "Switch that is only used while running tests. You never need to change this switch.",
    safeState = Off, sellByDate = never
  )

  val NeverExpiredSwitch = Switch("Unwired Test Switch", "never-expired-switch",
    "Switch that is only used while running tests. You never need to change this switch.",
    safeState = On, sellByDate = never
  )

  val AlwaysExpiredSwitch = Switch("Unwired Test Switch", "always-expired",
    "Switch that is only used while running tests. You never need to change this switch.",
    safeState = On, new DateMidnight().minusDays(1)
  )

  // Facia Tool Switches
  val ToolDisable = Switch("Facia Tool", "facia-tool-disable",
    "If this is switched on then the fronts tool is disabled",
    safeState = Off, sellByDate = never
  )

  val ToolConfigurationDisable = Switch("Facia Tool", "facia-tool-configuration-disable",
    "If this is switched on then the fronts configuration tool is disabled",
    safeState = Off, sellByDate = never
  )

  val ToolCheckPressLastmodified = Switch("Facia Tool", "facia-tool-check-press-lastmodified",
    "If this switch is on facia tool will alert the user if a front is not pressed withing 10 secs of an edit/publish",
    safeState = Off, sellByDate = never
  )

  val ToolSnaps = Switch("Facia Tool", "facia-tool-snaps",
    "If this is switched on then snaps can be created by dragging arbitrary links into the tool",
    safeState = Off, sellByDate = never
  )

  val ToolSparklines = Switch("Facia Tool", "facia-tool-sparklines",
    "If this is switched on then the fronts tool renders images from sparklines.ophan.co.uk",
    safeState = Off, sellByDate = never
  )

  val ContentApiPutSwitch = Switch("Facia Tool", "facia-tool-contentapi-put",
    "If this switch is on facia tool will PUT all collection changes to content api",
    safeState = Off, sellByDate = never
  )

  val FaciaToolPressSwitch = Switch("Front Press Switches", "facia-tool-press-front",
    "If this switch is on facia tool will press fronts on each change",
    safeState = Off, sellByDate = never
  )

  // Front Press Switches
  val FrontPressJobSwitch = Switch("Front Press Switches", "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off, sellByDate = never
  )

  // Image Switch

  val ImageServerSwitch = Switch("Image Server", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On, sellByDate = never // this is a performance related switch, not a feature switch
  )

  val all: List[Switch] = List(
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    StandardAdvertsSwitch,
    CommercialComponentsSwitch,
    VideoAdvertsSwitch,
    SponsoredSwitch,
    AudienceScienceSwitch,
    AudienceScienceGatewaySwitch,
    CriteoSwitch,
    LifeAndStyleHackSwitch,
    DiscussionSwitch,
    OpenCtaSwitch,
    FontSwitch,
    SearchSwitch,
    ReleaseMessageSwitch,
    IntegrationTestSwitch,
    ClientSideErrorSwitch,
    IdentityProfileNavigationSwitch,
    CssFromStorageSwitch,
    ElasticSearchSwitch,
    FacebookAutoSigninSwitch,
    IdentityFormstackSwitch,
    IdentityEthicalAwardsSwitch,
    IdentityAvatarUploadSwitch,
    ToolDisable,
    ToolConfigurationDisable,
    ToolCheckPressLastmodified,
    ToolSnaps,
    ToolSparklines,
    OphanSwitch,
    ScrollDepthSwitch,
    ContentApiPutSwitch,
    EffectiveMeasureSwitch,
    ImrWorldwideSwitch,
    ForeseeSwitch,
    MediaMathSwitch,
    DiagnosticsLogging,
    TravelOffersFeedSwitch,
    JobFeedSwitch,
    MasterclassFeedSwitch,
    SoulmatesFeedSwitch,
    MoneysupermarketFeedsSwitch,
    LCMortgageFeedSwitch,
    GuBookshopFeedsSwitch,
    NetworkFrontOptIn,
    ArticleSlotsSwitch,
    ImageServerSwitch,
    FaciaToolPressSwitch,
    ShowAllArticleEmbedsSwitch,
    FrontPressJobSwitch,
    LayoutHintsSwitch,
    RssLinkSwitch,
    PopularInTagSwitch,
    EnhanceTweetsSwitch,
    IndiaRegionSwitch,
    ABHomeComponent,
    MemcachedSwitch,
    IncludeBuildNumberInMemcachedKey,
    GzipSwitch
  )

  val grouped: List[(String, Seq[Switch])] = all.toList stableGroupBy { _.group }

  def byName(name: String): Option[Switch] = all.find(_.name.equals(name))
}

class SwitchBoardPlugin(app: Application) extends SwitchBoardAgent(Configuration)
class SwitchBoardAgent(config: GuardianConfiguration) extends Plugin with ExecutionContexts with Logging {

  def refresh() {
    log.info("Refreshing switches")
    WS.url(config.switches.configurationUrl).get() foreach { response =>
      response.status match {
        case 200 =>
          val nextState = Properties(response.body)

          for (switch <- Switches.all) {
            nextState.get(switch.name) foreach {
              case "on" => switch.switchOn()
              case "off" => switch.switchOff()
              case other => log.warn(s"Badly configured switch ${switch.name} -> $other")
            }
          }

        case _ => log.warn(s"Could not load switch config ${response.status} ${response.statusText}")
      }
    }
  }

  override def onStart() {
    Jobs.deschedule("SwitchBoardRefreshJob")
    Jobs.schedule("SwitchBoardRefreshJob", "0 * * * * ?") {
      refresh()
    }

    AkkaAsync {
      refresh()
    }
  }

  override def onStop() {
    Jobs.deschedule("SwitchBoardRefreshJob")
  }
}
