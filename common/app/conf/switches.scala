package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import implicits.Collections
import play.api.{Application, Plugin}
import play.api.libs.ws.WS
import org.joda.time.{Days, DateTime, DateMidnight}

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
  private lazy val endOfQ4 = new DateMidnight(2014, 4, 1)

  // this is 3 months - at the end of this a decision is expected
  // and one (or both) of the 2 needs to go.
  private lazy val profilingEvalDeadline = new DateMidnight(2014, 6, 4)


  // Load Switches

  val MemcachedSwitch = Switch("Performance Switches", "memcached",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = Off,
    // giving this a sell by date even though it is a perf switch as it is still a test.
    sellByDate = new DateMidnight(2014, 4, 30)
  )

  val IncludeBuildNumberInMemcachedKey = Switch("Performance Switches", "memcached-build-number",
    "If this switch is switched on then the MemcacheFilter will include the build number in the cache key",
    safeState = Off,
    // giving this a sell by date even though it is a perf switch as it is still a test.
    sellByDate = new DateMidnight(2014, 4, 30)
  )

  val AutoRefreshSwitch = Switch("Performance Switches", "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off, sellByDate = never
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

//  val AdvertSwitch = Switch("Advertising", "adverts",
//    "Master switch for all types of adverts (including commercial components).",
//    safeState = On, sellByDate = never
//  )

//  val OASAdvertSwitch = Switch("Advertising", "oas-adverts",
//    "If this switch is on then OAS adverts will be loaded with JavaScript.",
//    safeState = Off, sellByDate = new DateMidnight(2014, 4, 8)
//  )
//
//  val DFPAdvertSwitch = Switch("Advertising", "dfp-adverts",
//    "If this switch is on then DFP adverts will be loaded with JavaScript.",
//    safeState = Off, sellByDate = new DateMidnight(2014, 4, 8)
//  )
//
//  val LoadOnlyCommercialComponents = Switch("Advertising", "load-only-commercial-components",
//    "If this switch is on then only commercial components will be loaded via DFP.",
//    safeState = On, sellByDate = new DateMidnight(2014, 4, 8)
//  )

//  val VideoAdvertSwitch = Switch("Advertising", "video-adverts",
//    "If this switch is on then OAS video adverts will be loaded with JavaScript.",
//    safeState = Off, sellByDate = never
//  )

  val AdvertsSwitch = Switch("Advertising", "adverts",
    "Master switch for all types of adverts (including commercial components).",
    safeState = On, sellByDate = never
  )

  val StandardAdvertsSwitch = Switch("Advertising", "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On, sellByDate = never
  )

  val CommercialComponentsSwitch = Switch("Advertising", "commercial-components",
    "Display commercial components (jobs, soulmates).",
    safeState = On, sellByDate = never
  )

  val VideoAdvertsSwitch = Switch("Advertising", "video-adverts",
    "Show adverts on videos.",
    safeState = On, sellByDate = never
  )

  // Commercial Tags

  val AudienceScienceSwitch = Switch("Commercial Tags", "audience-science",
    "If this switch is on Audience Science segments will be used to target ads.",
    safeState = Off, sellByDate = never)

  val ImrWorldwideSwitch = Switch("Commercial Tags", "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off, sellByDate = profilingEvalDeadline)

  val EffectiveMeasureSwitch = Switch("Commercial Tags", "effective-measure",
    "Enable the Effective Measure audience segment tracking.",
    safeState = Off, sellByDate = profilingEvalDeadline)

  val ForeseeSwitch = Switch("Commercial Tags", "foresee",
    "Enable Forsee surveys for a sample of our audience",
    safeState = Off, sellByDate = new DateMidnight(2014,5,1)) // 3 month trial

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

  val OmnitureVerificationSwitch = Switch("Analytics", "omniture-verification",
    "Enables the new Ophan tracking javascript which support multiple events per page",
    safeState = Off,
    // extending this till mid April. We are going to use it to see what effect moving Omniture higher up the
    // call stack makes.
    new DateMidnight(2014, 4, 15)
  )

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
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 1)
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

  val IdentityEthicalAwardsSwitch = Switch("Feature Switches", "id-ethical-awards",
    "If this switch is on, Ethical awards forms will be available",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 15))

  val NetworkFrontOptIn = Switch("Feature Switches", "network-front-opt-in",
    "If this is switched on then an opt-in message will be displayed to users coming from the R2 network front",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  val ArticleSlotsSwitch = Switch("Feature Switches", "article-slots",
    "If this switch is on, inline content slots (for stories, ads, etc) will be generated in article bodies",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
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
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  val HelveticaEasterEggSwitch = Switch("Feature Switches", "helvetica",
    "If this switch is on, the article about Helvetica will have its title Helvetica'd",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  val RssLinkSwitch = Switch("Feature Switches", "rss-link",
    "If this switch is on a link to the RSS is rendered in the HTML",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 7)
  )

  val PopularInTagSwitch = Switch("Feature Switches", "popular-in-tag",
    "If this switch is turned on then popular-in-tag will override related content for the selected tags.",
    safeState = Off, sellByDate = new DateMidnight(2014, 5, 14)
  )

  val HideOldTimeStampsSwitch = Switch("Feature Switches", "hide-old-timestamps",
    "If this switch is turned on then timestamps older than an hour get hidden on fronts.",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 28)
  )

  // A/B Test Switches

  val ABExternalLinksNewWindow = Switch("A/B Tests", "ab-external-links-new-window",
    "If this switch is on, AB test opening external links in a new tab/window.",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 28)
  )

  val ABAbcd = Switch("A/B Tests", "ab-abcd",
    "If this switch is on, an AB test runs to validate the collection ab test data",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 28)
  )

  val FootballLiveblogTruncation = Switch("A/B Tests", "ab-football-liveblog-truncation",
    "If you swith cthis switch on, an AB test will run to truncate football liveblogs.",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 21)
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
    AdvertsSwitch,
    StandardAdvertsSwitch,
    CommercialComponentsSwitch,
    VideoAdvertsSwitch,
    AudienceScienceSwitch,
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
    ToolDisable,
    ToolConfigurationDisable,
    ToolSparklines,
    OphanSwitch,
    ScrollDepthSwitch,
    ContentApiPutSwitch,
    EffectiveMeasureSwitch,
    ImrWorldwideSwitch,
    ForeseeSwitch,
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
    HelveticaEasterEggSwitch,
    RssLinkSwitch,
    PopularInTagSwitch,
    HideOldTimeStampsSwitch,
    OmnitureVerificationSwitch,
    IndiaRegionSwitch,
    ABExternalLinksNewWindow,
    ABAbcd,
    FootballLiveblogTruncation,
    MemcachedSwitch,
    IncludeBuildNumberInMemcachedKey
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
