package conf

import common._
import implicits.Collections
import org.joda.time.{Days, DateTime, LocalDate}
import play.api.libs.ws.WS
import play.api.{Application, Plugin}
import play.api.Play.current

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

case class Switch( group: String,
                   name: String,
                   description: String,
                   safeState: SwitchState,
                   sellByDate: LocalDate
                 ) extends Switchable {

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn && new LocalDate().isBefore(sellByDate)

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

  def daysToExpiry = Days.daysBetween(new DateTime(), sellByDate.toDateTimeAtStartOfDay).getDays

  def expiresSoon = daysToExpiry < 7
}

object Switches extends Collections {

  // Switch names can be letters numbers and hyphens only

  private lazy val never = new LocalDate(2100, 1, 1)

  // Performance
  val TagPageSizeSwitch = Switch("Performance", "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    safeState = Off,
    sellByDate = never
  )

  val CircuitBreakerSwitch = Switch("Performance", "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    safeState = Off,
    sellByDate = new LocalDate(2014, 11, 30)
  )

  val ForceHttpResponseCodeSwitch = Switch("Performance", "force-response-codes",
    "If this switch is switched on and you specify the correct header, then you can force a specific http response code",
    safeState = Off,
    sellByDate = new LocalDate(2014, 12, 31)
  )


  val MemcachedSwitch = Switch("Performance", "memcached-action",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = On,
    sellByDate = never
  )

  val MemcachedFallbackSwitch = Switch("Performance", "memcached-fallback",
    "If this switch is switched on then the MemcachedFallback will be operational",
    safeState = Off,
    sellByDate = never
  )

  val IncludeBuildNumberInMemcachedKey = Switch("Performance", "memcached-build-number",
    "If this switch is switched on then the MemcacheFilter will include the build number in the cache key",
    safeState = Off,
    sellByDate = never
  )

  val AutoRefreshSwitch = Switch("Performance", "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off, sellByDate = never
  )

  val DoubleCacheTimesSwitch = Switch("Performance", "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On, sellByDate = never
  )

  val RelatedContentSwitch = Switch("Performance", "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On, sellByDate = never
  )

  val FlyerSwitch = Switch("Performance", "flyers",
    "If this switch is turned off then flyers will not be shown. Turn off to help handle exceptional load.",
     safeState = On, sellByDate = never
  )

  val AjaxRelatedContentSwitch = Switch("Performance", "ajax-related-content",
    "If this switch is turned on then related be loaded via ajax and not inline. Also requires related-content switch to be on.",
    safeState = On, sellByDate = never
  )

  val InlineCriticalCss = Switch("Performance", "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    safeState = On, sellByDate = never
  )

  val ShowAllArticleEmbedsSwitch = Switch("Performance", "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On, sellByDate = never
  )

  val DiscussionSwitch = Switch("Performance", "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = Off, sellByDate = never
  )

  val OpenCtaSwitch = Switch("Performance", "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API is blowing up.",
    safeState = Off, sellByDate = never
  )

  val ImageServerSwitch = Switch("Performance", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On, sellByDate = never
  )

  val PngResizingSwitch = Switch("Performance", "png-resizing",
    "If this switch is on png images will be resized via the png-resizing server",
    safeState = Off, sellByDate = never
  )

  // Commercial

  val DfpCachingSwitch = Switch("Commercial", "dfp-caching",
    "Have Admin will poll DFP to precache adserving data.",
    safeState = On, sellByDate = never
  )

  val CommercialSwitch = Switch("Commercial", "commercial",
    "Kill switch for all commercial JS.",
    safeState = On, sellByDate = never
  )

  val StandardAdvertsSwitch = Switch("Commercial", "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On, sellByDate = never
  )

  val CommercialComponentsSwitch = Switch("Commercial", "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    safeState = On, sellByDate = never
  )

  val VideoAdvertsSwitch = Switch("Commercial", "video-adverts",
    "Show adverts on videos.",
    safeState = On, sellByDate = never
  )

  val SponsoredSwitch = Switch("Commercial", "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On, sellByDate = never
  )

  val LiveblogAdvertsSwitch = Switch("Commercial", "liveblog-adverts",
    "Show inline adverts on liveblogs",
    safeState = Off, sellByDate = never
  )

  val AudienceScienceSwitch = Switch("Commercial", "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off, sellByDate = never
  )

  val AudienceScienceGatewaySwitch = Switch("Commercial", "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off, sellByDate = never
  )

  val CriteoSwitch = Switch("Commercial", "criteo",
    "If this switch is on, Criteo segments will be used to target ads.",
    safeState = Off, sellByDate = never
  )

  val EffectiveMeasureSwitch = Switch("Commercial", "effective-measure",
    "Enable the Effective Measure audience segment tracking.",
    safeState = Off, sellByDate = never)

  val ImrWorldwideSwitch = Switch("Commercial", "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off, sellByDate = never)

  val targetMediaMathShutdownDate = new LocalDate(2015, 1, 6)

  val MediaMathSwitch = Switch("Commercial", "media-math",
    "Enable Media Math audience segment tracking",
    safeState = Off, sellByDate = targetMediaMathShutdownDate)

  val KruxSwitch = Switch("Commercial", "krux",
    "Enable Krux Control Tag",
    safeState = Off, sellByDate = targetMediaMathShutdownDate)

  val RemarketingSwitch = Switch("Commercial", "remarketing",
    "Enable Remarketing tracking",
    safeState = Off, sellByDate = never)

  val TravelOffersFeedSwitch = Switch("Commercial", "gu-travel-offers",
    "If this switch is on, commercial components will be fed by travel offer feed.",
    safeState = Off, sellByDate = never)

  val JobFeedSwitch = Switch("Commercial", "gu-jobs",
    "If this switch is on, commercial components will be fed by job feed.",
    safeState = Off, sellByDate = never)

  val MasterclassFeedSwitch = Switch("Commercial", "gu-masterclasses",
    "If this switch is on, commercial components will be fed by masterclass feed.",
    safeState = Off, sellByDate = never)

  val SoulmatesFeedSwitch = Switch("Commercial", "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off, sellByDate = never)

  val MoneysupermarketFeedsSwitch = Switch("Commercial", "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off, sellByDate = never)

  val LCMortgageFeedSwitch = Switch("Commercial", "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off, sellByDate = never)

  val GuBookshopFeedsSwitch = Switch("Commercial", "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off, sellByDate = never)

  val GlobalDevelopmentQualtrics = Switch("Commercial", "global-development-qualtrics",
    "If this switch is on, the Qualtrics tracking tag for global development will be enabled.",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 30)
  )

  // Monitoring

  val OphanSwitch = Switch("Monitoring", "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On, never
  )

  val DiagnosticsLogging = Switch("Monitoring", "enable-diagnostics-logging",
    "If this switch is on, then js error reports and requests sent to the Diagnostics servers will be logged.",
    safeState = On, never
  )

  val MetricsSwitch = Switch("Monitoring", "enable-metrics-non-prod",
    "If this switch is on, then metrics will be pushed to cloudwatch on DEV and CODE",
    safeState = Off, never
  )

  val ScrollDepthSwitch = Switch("Monitoring", "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off, never
  )

  // Features


  val PollPreviewForFreshContentSwitch = Switch("Feature", "poll-preview-for-fresh-content",
    "If switched on then the preview server will poll until the latest content is indexed.",
    safeState = On, sellByDate = new LocalDate(2015, 1, 15))

  val OutbrainSwitch = Switch("Feature", "outbrain",
    "Enable the Outbrain content recommendation widget.",
    safeState = Off, sellByDate = never)

  val ForeseeSwitch = Switch("Feature", "foresee",
    "Enable Foresee surveys for a sample of our audience",
    safeState = Off, sellByDate = never)

  val ReleaseMessageSwitch = Switch("Feature", "release-message",
    "If this is switched on users will be messaged that they are inside the beta release",
    safeState = Off, sellByDate = new LocalDate(2014, 12, 5)
  )

  val GeoMostPopular = Switch("Feature", "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    safeState = On, sellByDate = never
  )

  val FontSwitch = Switch("Feature", "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = On, sellByDate = never
  )

  val SearchSwitch = Switch("Feature", "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = Off, sellByDate = never
  )

  val IdentityProfileNavigationSwitch = Switch("Feature", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On, sellByDate = never
  )

  val FacebookAutoSigninSwitch = Switch("Feature", "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not recently signed out are automatically signed in.",
    safeState = Off, sellByDate = never
  )

  val IdentityFormstackSwitch = Switch("Feature", "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off, sellByDate = never
  )

  val IdentityAvatarUploadSwitch = Switch("Feature", "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    safeState = Off, sellByDate = never
  )

  val EnhanceTweetsSwitch = Switch("Feature", "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    safeState = Off, sellByDate = never
  )

  val EnhancedMediaPlayerSwitch = Switch("Feature", "enhanced-media-player",
    "If this is switched on then videos are enhanced using our JavaScript player",
    safeState = On, sellByDate = never
  )

  val BreakingNewsSwitch = Switch("Feature", "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 30)
  )

  val DiscussionPageSizeSwitch = Switch("Feature", "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 30)
  )

  // actually just here to make us remove this in the future
  val GuShiftCookieSwitch = Switch("Feature", "gu-shift-cookie",
    "If switched on, the GU_SHIFT cookie will be updated when users opt into or out of Next Gen",
    safeState = On, sellByDate = new LocalDate(2014, 12, 5)
  )

  val IdentityBlockSpamEmails = Switch("Feature", "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    safeState = On, sellByDate = never)
  // A/B Tests

  val IdentityLogRegistrationsFromTor = Switch("Feature", "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor esit node will be logged",
    safeState = On, sellByDate = never)

  val ABHighCommercialComponent = Switch("A/B Tests", "ab-high-commercial-component",
    "Switch for the High Commercial Component A/B test.",
    safeState = Off, sellByDate = never
  )

  // Facia

  val ToolDisable = Switch("Facia", "facia-tool-disable",
    "If this is switched on then the fronts tool is disabled",
    safeState = Off, sellByDate = never
  )

  val ToolSparklines = Switch("Facia", "facia-tool-sparklines",
    "If this is switched on then the fronts tool renders images from sparklines.ophan.co.uk",
    safeState = Off, sellByDate = never
  )

  val ContentApiPutSwitch = Switch("Facia", "facia-tool-contentapi-put",
    "If this switch is on facia tool will PUT all collection changes to content api",
    safeState = Off, sellByDate = never
  )

  val FaciaToolPressSwitch = Switch("Facia", "facia-tool-press-front",
    "If this switch is on facia tool will press fronts on each change",
    safeState = Off, sellByDate = never
  )

  val FaciaToolDraftContent = Switch("Facia", "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content ",
    safeState = Off, sellByDate = never
  )

  val FaciaToolCachedContentApiSwitch = Switch("Facia", "facia-tool-cached-capi-requests",
    "If this switch is on facia tool will cache responses from the content API and use them on failure",
    safeState = On, sellByDate = never
  )

  val FrontPressJobSwitch = Switch("Facia", "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off, sellByDate = never
  )

  val FootballFeedRecorderSwitch = Switch("Feature", "football-feed-recorder",
    "If switched on then football matchday feeds will be recorded every minute",
    safeState = Off, sellByDate = never)

  val CrosswordSvgThumbnailsSwitch = Switch("Feature", "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    safeState = Off, sellByDate = never
  )

  val ContainerUpdatesSwitch = Switch("Facia", "container-updates",
    "Enables js detection that containers have updated since page load",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 30)
  )

  val all: List[Switch] = List(
    TagPageSizeSwitch,
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    FlyerSwitch,
    AjaxRelatedContentSwitch,
    DfpCachingSwitch,
    CommercialSwitch,
    StandardAdvertsSwitch,
    CommercialComponentsSwitch,
    VideoAdvertsSwitch,
    LiveblogAdvertsSwitch,
    SponsoredSwitch,
    AudienceScienceSwitch,
    AudienceScienceGatewaySwitch,
    CriteoSwitch,
    DiscussionSwitch,
    OpenCtaSwitch,
    FontSwitch,
    SearchSwitch,
    ReleaseMessageSwitch,
    IdentityProfileNavigationSwitch,
    InlineCriticalCss,
    FacebookAutoSigninSwitch,
    IdentityFormstackSwitch,
    IdentityAvatarUploadSwitch,
    ToolDisable,
    ToolSparklines,
    OphanSwitch,
    ScrollDepthSwitch,
    ContentApiPutSwitch,
    EffectiveMeasureSwitch,
    ImrWorldwideSwitch,
    ForeseeSwitch,
    MediaMathSwitch,
    KruxSwitch,
    RemarketingSwitch,
    OutbrainSwitch,
    DiagnosticsLogging,
    TravelOffersFeedSwitch,
    JobFeedSwitch,
    MasterclassFeedSwitch,
    SoulmatesFeedSwitch,
    MoneysupermarketFeedsSwitch,
    LCMortgageFeedSwitch,
    GuBookshopFeedsSwitch,
    ImageServerSwitch,
    FaciaToolPressSwitch,
    ShowAllArticleEmbedsSwitch,
    FrontPressJobSwitch,
    EnhanceTweetsSwitch,
    MemcachedSwitch,
    MemcachedFallbackSwitch,
    IncludeBuildNumberInMemcachedKey,
    GeoMostPopular,
    FaciaToolCachedContentApiSwitch,
    FaciaToolDraftContent,
    GuShiftCookieSwitch,
    IdentityBlockSpamEmails,
    IdentityLogRegistrationsFromTor,
    ABHighCommercialComponent,
    EnhancedMediaPlayerSwitch,
    BreakingNewsSwitch,
    DiscussionPageSizeSwitch,
    MetricsSwitch,
    FootballFeedRecorderSwitch,
    ForceHttpResponseCodeSwitch,
    CircuitBreakerSwitch,
    PollPreviewForFreshContentSwitch,
    PngResizingSwitch,
    GlobalDevelopmentQualtrics,
    CrosswordSvgThumbnailsSwitch,
    ContainerUpdatesSwitch
  )

  val httpSwitches: List[Switch] = List(
  )

  val grouped: List[(String, Seq[Switch])] = all.toList stableGroupBy { _.group }

  def byName(name: String): Option[Switch] = all.find(_.name == name)
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

// not really a switch, but I need to use this combination of switches in a number of place.
object InlineRelatedContentSwitch {
  def isSwitchedOn: Boolean = Switches.RelatedContentSwitch.isSwitchedOn && Switches.AjaxRelatedContentSwitch.isSwitchedOff
}
