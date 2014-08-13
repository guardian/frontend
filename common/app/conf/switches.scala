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

  // Load Switches

  val MemcachedSwitch = Switch("Performance Switches", "memcached-action",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = On,
    sellByDate = never
  )

  val MemcachedFallbackSwitch = Switch("Performance Switches", "memcached-fallback",
    "If this switch is switched on then the MemcachedFallback will be operational",
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

  val CommercialSwitch = Switch("Advertising", "commercial",
    "Kill switch for all commercial JS.",
    safeState = On, sellByDate = never
  )

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

  val SmartBannerSwitch = Switch("Advertising", "smart-banner",
    "Display smart app banner onboarding message to iOS and Android users",
    safeState = Off, sellByDate = new LocalDate(2014, 8, 31)
  )

  // Commercial Tags

  val AudienceScienceSwitch = Switch("Commercial Tags", "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 1))

  val AudienceScienceGatewaySwitch = Switch("Commercial Tags", "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 1))

  val CriteoSwitch = Switch("Commercial Tags", "criteo",
    "If this switch is on, Criteo segments will be used to target ads.",
    safeState = Off, sellByDate = new LocalDate(2014, 11, 1))

  val EffectiveMeasureSwitch = Switch("Commercial Tags", "effective-measure",
    "Enable the Effective Measure audience segment tracking.",
    safeState = Off, sellByDate = never)

  val ImrWorldwideSwitch = Switch("Commercial Tags", "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off, sellByDate = never)

  val MediaMathSwitch = Switch("Commercial Tags", "media-math",
    "Enable Media Math audience segment tracking",
    safeState = Off, sellByDate = never)

  val RemarketingSwitch = Switch("Commercial Tags", "remarketing",
    "Enable Remarketing tracking",
    safeState = Off, sellByDate = never)

  // Content Recommendation

  val OutbrainSwitch = Switch("Content Recommendation", "outbrain",
    "Enable the Outbrain content recommendation widget.",
    safeState = Off, sellByDate = never)


  // We don't foresee this service being switched off
  val ForeseeSwitch = Switch("Performance Switches", "foresee",
    "Enable Foresee surveys for a sample of our audience",
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
    safeState = On, never
  )

  val ScrollDepthSwitch = Switch("Analytics", "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off, never
  )

  // Feature Switches

  val ReleaseMessageSwitch = Switch("Feature Switches", "release-message",
    "If this is switched on users will be messaged that they are inside the beta release",
    safeState = Off, sellByDate = new LocalDate(2014, 8, 31)
  )

  val GeoMostPopular = Switch("Feature Switches", "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    safeState = On, sellByDate = never
  )

  val FontSwitch = Switch("Feature Switches", "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = On, sellByDate = never
  )

  val SearchSwitch = Switch("Feature Switches", "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = Off, sellByDate = never
  )

  val IdentityProfileNavigationSwitch = Switch("Feature Switches", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On, sellByDate = never
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

  val IndiaRegionSwitch = Switch("Feature Switches", "india-region",
    "If this switch is switched on then the India region will be enabled",
    safeState = Off,
    // I know this is far away, but this will lie dormant for a while (other than testing) while
    // the planets align for the rest of the project
    sellByDate = new LocalDate(2014, 10, 30)
  )

  val EnhanceTweetsSwitch = Switch("Feature Switches", "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    safeState = Off, sellByDate = never
  )

  val SentimentalCommentsSwitch = Switch("Feature Switches", "sentimental-comments",
    "When this switch is on, you will be able to put sentiment into your comments.",
    safeState = Off, sellByDate = new LocalDate(2014, 9, 1)
  )

  val EnhancedMediaPlayerSwitch = Switch("Feature Switches", "enhanced-media-player",
    "If this is switched on then videos are enhanced using our JavaScript player",
    safeState = On, sellByDate = never
  )

  val BreakingNewsSwitch = Switch("Feature Switches", "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    safeState = Off, sellByDate = new LocalDate(2014, 9, 30)
  )

  // A/B Tests

  val ABHighCommercialComponent = Switch("A/B Tests", "ab-high-commercial-component",
    "Switch for the High Commercial Component A/B test.",
    safeState = Off, sellByDate = never
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
    safeState = On, new LocalDate().minusDays(1)
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

  val ToolImageOverride = Switch("Facia Tool", "facia-tool-image-override",
    "If this is switched on then images can be overridden in the fronts tool",
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

  val FaciaToolDraftPressSwitch = Switch("Front Press Switches", "facia-tool-press-draft-front",
    "If this switch is on facia tool will press draft fronts on each change",
    safeState = Off, sellByDate = never
  )

  val FaciaToolDraftContent = Switch("Front Press Switches", "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content ",
    safeState = Off, sellByDate = never
  )

  val FaciaToolCachedContentApiSwitch = Switch("Front Press Switches", "facia-tool-cached-capi-requests",
    "If this switch is on facia tool will cache responses from the content API and use them on failure",
    safeState = On, sellByDate = never
  )

  val FaciaToolCachedZippingContentApiSwitch = Switch("Front Press Switches", "facia-tool-zipcached-capi-requests",
    "If this switch is on facia tool will zip cache responses from the content API and use them on failure",
    safeState = On, sellByDate = never
  )

  // Front Press Switches
  val FrontPressJobSwitch = Switch("Front Press Switches", "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off, sellByDate = never
  )

  val FaciaToolContainerTagsSwitch = Switch("Facia Tool", "facia-tool-tags",
    "If this switch is on the container configuration will allow articles to show their tags or sections",
    safeState = Off, sellByDate = new LocalDate(2014, 9, 2)
  )

  val ImageServerSwitch = Switch("Image Server", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On, sellByDate = never // this is a performance related switch, not a feature switch
  )

  val SeoOptimisedContentImageSwitch = Switch("Image Server", "seo-optimised-article-image",
    "If this switch is on images then articles will get a 460px on static.guim.co.uk image as the low-res version.",
    safeState = On, sellByDate = new LocalDate(2014, 8, 30)
  )

  // actually just here to make us remove this in the future
  val GuShiftCookieSwitch = Switch("Feature Switches", "gu-shift-cookie",
    "If switched on, the GU_SHIFT cookie will be updated when users opt into or out of Next Gen",
    safeState = On, sellByDate = new LocalDate(2014, 9, 30)
  )

  val CenturyRedirectionSwitch = Switch("Feature Switches", "redirect-century-pages",
    "If switched on, we redirect /century and /century/yyyy-yyyy to valid (non-R1) endpoints",
    safeState = Off,

    // extending as the owner of the switch is on holiday.
    sellByDate = new LocalDate(2014, 8, 18)
  )

  val ChildrensBooksSwitch = Switch("Feature Switches", "childrens-books-hide-popular",
    "If switched on, video pages in the childrens books section will not show popular videos",
    safeState = On, sellByDate = new LocalDate(2014, 9, 8)
  )

  val all: List[Switch] = List(
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    CommercialSwitch,
    StandardAdvertsSwitch,
    CommercialComponentsSwitch,
    VideoAdvertsSwitch,
    SponsoredSwitch,
    AudienceScienceSwitch,
    AudienceScienceGatewaySwitch,
    CriteoSwitch,
    DiscussionSwitch,
    OpenCtaSwitch,
    FontSwitch,
    SearchSwitch,
    ReleaseMessageSwitch,
    IntegrationTestSwitch,
    IdentityProfileNavigationSwitch,
    CssFromStorageSwitch,
    FacebookAutoSigninSwitch,
    IdentityFormstackSwitch,
    IdentityAvatarUploadSwitch,
    ToolDisable,
    ToolConfigurationDisable,
    ToolCheckPressLastmodified,
    ToolSnaps,
    ToolImageOverride,
    ToolSparklines,
    OphanSwitch,
    ScrollDepthSwitch,
    ContentApiPutSwitch,
    EffectiveMeasureSwitch,
    ImrWorldwideSwitch,
    ForeseeSwitch,
    MediaMathSwitch,
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
    FaciaToolContainerTagsSwitch,
    EnhanceTweetsSwitch,
    SentimentalCommentsSwitch,
    IndiaRegionSwitch,
    MemcachedSwitch,
    MemcachedFallbackSwitch,
    IncludeBuildNumberInMemcachedKey,
    GeoMostPopular,
    SmartBannerSwitch,
    SeoOptimisedContentImageSwitch,
    FaciaToolCachedContentApiSwitch,
    FaciaToolCachedZippingContentApiSwitch,
    FaciaToolDraftPressSwitch,
    FaciaToolDraftContent,
    GuShiftCookieSwitch,
    ABHighCommercialComponent,
    EnhancedMediaPlayerSwitch,
    BreakingNewsSwitch,
    CenturyRedirectionSwitch,
    ChildrensBooksSwitch
  )

  val httpSwitches: List[Switch] = List(
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
