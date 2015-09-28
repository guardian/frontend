package conf

import java.util.concurrent.TimeoutException

import common._
import conf.Configuration.environment
import org.joda.time.{DateTime, Days, Interval, LocalDate}
import play.api.Play

import scala.concurrent.duration._
import scala.concurrent.{Future, Promise}

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

trait Initializable[T] extends ExecutionContexts with Logging {

  private val initialized = Promise[T]()

  protected val initializationTimeout: FiniteDuration = 2.minutes

  if (Play.maybeApplication.isDefined) {
    AkkaAsync.after(initializationTimeout) {
      initialized.tryFailure {
        new TimeoutException(s"Initialization timed out after $initializationTimeout")
      }
    }
  }

  def initialized(t: T): Unit = initialized.trySuccess(t)

  def onInitialized: Future[T] = initialized.future
}


trait SwitchTrait extends Switchable with Initializable[SwitchTrait] {
  val group: String
  val name: String
  val description: String
  val safeState: SwitchState
  val sellByDate: LocalDate
  val exposeClientSide: Boolean

  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn && new LocalDate().isBefore(sellByDate)

  def switchOn() {
    if (isSwitchedOff) {
      delegate.switchOn()
    }
    initialized(this)
  }
  def switchOff() {
    if (isSwitchedOn) {
      delegate.switchOff()
    }
    initialized(this)
  }

  def daysToExpiry = Days.daysBetween(new DateTime(), sellByDate.toDateTimeAtStartOfDay).getDays

  def expiresSoon = daysToExpiry < 7

  def hasExpired = daysToExpiry == 0

  Switch.switches.send(this :: _)
}

case class Switch(
  group: String,
  name: String,
  description: String,
  safeState: SwitchState,
  sellByDate: LocalDate,
  exposeClientSide: Boolean
) extends SwitchTrait

case class TimerSwitch(
  group: String,
  name: String,
  description: String,
  safeState: SwitchState,
  sellByDate: LocalDate,
  activePeriods: Seq[Interval],
  exposeClientSide: Boolean
) extends SwitchTrait with Logging {

  def isSwitchedOnAndActive: Boolean = {
    val active = activePeriods.exists(_.containsNow())
    isSwitchedOn && (environment.isNonProd || active)
  }
}

object Switch {
  val switches = AkkaAgent[List[SwitchTrait]](Nil)
  def allSwitches: Seq[SwitchTrait] = switches.get()
}

object Switches {

  // Switch names can be letters numbers and hyphens only

  lazy val never = new LocalDate(2100, 1, 1)

  // Performance
  val InlineJsSwitch = Switch(
    "Performance",
    "inline-js",
    "If this switch is on, InlineJs object will use the closure compiler",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )


  val LazyLoadContainersSwitch = Switch(
    "Performance",
    "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TagPageSizeSwitch = Switch(
    "Performance",
    "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoftPurgeWithLongCachingSwitch = Switch(
    "Performance",
    "soft-purge-with-long-caching-switch",
    "If this switch is on then articles will get a longer cache time, but we will soft purge them from the CDN",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = false
  )

  val CircuitBreakerSwitch = Switch(
    "Performance",
    "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MemcachedSwitch = Switch(
    "Performance",
    "memcached-action",
    "If this switch is switched on then the MemcacheAction will be operational",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val MemcachedFallbackSwitch = Switch(
    "Performance",
    "memcached-fallback",
    "If this switch is switched on then the MemcachedFallback will be operational",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IncludeBuildNumberInMemcachedKey = Switch(
    "Performance",
    "memcached-build-number",
    "If this switch is switched on then the MemcacheFilter will include the build number in the cache key",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AutoRefreshSwitch = Switch(
    "Performance",
    "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DoubleCacheTimesSwitch = Switch(
    "Performance",
    "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val RelatedContentSwitch = Switch(
    "Performance",
    "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val RichLinkSwitch = Switch(
    "Performance",
    "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val InlineCriticalCss = Switch(
    "Performance",
    "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val AsyncCss = Switch(
    "Performance",
    "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet " +
      "has loaded using javascript. Disabling it will use standard link elements.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ShowAllArticleEmbedsSwitch = Switch(
    "Performance",
    "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ExternalVideoEmbeds = Switch(
    "Performance",
    "external-video-embeds",
    "If switched on then we will accept and display external video views",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionSwitch = Switch(
    "Performance",
    "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiscussionPageSizeSwitch = Switch(
    "Performance",
    "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val OpenCtaSwitch = Switch(
    "Performance",
    "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API " +
      "is blowing up.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImageServerSwitch = Switch(
    "Performance",
    "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val Viewability = Switch(
    "Performance",
    "viewability",
    "Viewability - Includes whole viewability package: ads lazy loading, sticky header, sticky MPU, spacefinder 2.0, dynamic ads, ad next to comments",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val DisableStickyNavOnMobileSwitch = Switch(
    "Performance",
    "disable-sticky-nav-on-mobile",
    "If this switch is on, the sticky nav will be disabled on mobile.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SaveForLaterSwitch = Switch(
    "Performance",
    "save-for-later",
    "It this switch is turned on, user are able to save articles. Turn off if this causes overload on then identity api" ,
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val BackgroundJSSwitch = Switch(
    "Performance",
    "background-js",
    "It this switch is turned on, bootstrap javascript will run in small chunks on timeouts",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = true
  )

  val ServeCoreFrontsToSomeIpadsSwitch = Switch(
    "Performance",
    "ipad-core-fronts",
    "Serve core fronts to a random percentage of crash-prone ipad users",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 31),
    exposeClientSide = true
  )

  // Commercial
  val NoMobileTopAdSwitch = Switch(
    "Commercial",
    "no-mobile-top-ad",
    "On mobile there is no top banner and we are showing only two MPUs",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = true
  )

  val DfpCachingSwitch = Switch(
    "Commercial",
    "dfp-caching",
    "Have Admin will poll DFP to precache adserving data.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val CommercialSwitch = Switch(
    "Commercial",
    "commercial",
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val StandardAdvertsSwitch = Switch(
    "Commercial",
    "standard-adverts",
    "Display 'standard' adverts, e.g. top banner ads, inline ads, MPUs, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val CommercialComponentsSwitch = Switch(
    "Commercial",
    "commercial-components",
    "Display commercial components, e.g. jobs, soulmates.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VideoAdvertsSwitch = Switch(
    "Commercial",
    "video-adverts",
    "Show adverts on videos.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val VpaidAdvertsSwitch = Switch(
    "Commercial",
    "vpaid-adverts",
    "Turns on support for vpaid-format adverts on videos.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SponsoredSwitch = Switch(
    "Commercial",
    "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val LiveblogAdvertsSwitch = Switch(
    "Commercial",
    "liveblog-adverts",
    "Show inline adverts on liveblogs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceSwitch = Switch(
    "Commercial",
    "audience-science",
    "If this switch is on, Audience Science segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val AudienceScienceGatewaySwitch = Switch(
    "Commercial",
    "audience-science-gateway",
    "If this switch is on, Audience Science Gateway segments will be used to target ads.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ImrWorldwideSwitch = Switch(
    "Commercial",
    "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val KruxSwitch = Switch(
    "Commercial",
    "krux",
    "Enable Krux Control Tag",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RemarketingSwitch = Switch(
    "Commercial",
    "remarketing",
    "Enable Remarketing tracking",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val TravelOffersFeedSwitch = Switch(
    "Commercial",
    "gu-travel-offers",
    "If this switch is on, commercial components will be fed by travel offer feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val JobFeedSwitch = Switch(
    "Commercial",
    "gu-jobs",
    "If this switch is on, commercial components will be fed by job feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MembersAreaSwitch = Switch(
    "Commercial",
    "gu-members-area",
    "If this switch is on, content flagged with membershipAccess will be protected",
    safeState = On,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = false
  )

  val MasterclassFeedSwitch = Switch(
    "Commercial",
    "gu-masterclasses",
    "If this switch is on, commercial components will be fed by masterclass feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val SoulmatesFeedSwitch = Switch(
    "Commercial",
    "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val MoneysupermarketFeedsSwitch = Switch(
    "Commercial",
    "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val LCMortgageFeedSwitch = Switch(
    "Commercial",
    "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val GuBookshopFeedsSwitch = Switch(
    "Commercial",
    "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val BookLookupSwitch = Switch(
    "Commercial",
    "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AdBlockMessage = Switch(
    "Commercial",
    "adblock",
    "Switch for the Adblock Message.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FixedTopAboveNavAdSlotSwitch = Switch(
    "Commercial",
    "fixed-top-above-nav",
    "Fixes size of top-above-nav ad slot on fronts.",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 7),
    exposeClientSide = false
  )

  val KruxVideoTracking = Switch(
    "Commercial",
    "krux-video-tracking",
    "If this switch is ON, there will be a Krux pixel fired to track particular videos",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val AdFreeExperience = Switch(
    "Commercial",
    "advert-opt-out",
    "Enable adfree experience. See with cookie 'gu_adfree_user' = true",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 9),
    exposeClientSide = true
  )

  // Monitoring

  val OphanSwitch = Switch(
    "Monitoring",
    "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val DiagnosticsLogging = Switch(
    "Monitoring",
    "enable-diagnostics-logging",
    "If this switch is on, then js error reports and requests sent to the Diagnostics servers will be logged.",
    safeState = On,
    never,
    exposeClientSide = false
  )

  val MetricsSwitch = Switch(
    "Monitoring",
    "enable-metrics-non-prod",
    "If this switch is on, then metrics will be pushed to cloudwatch on DEV and CODE",
    safeState = Off,
    never,
    exposeClientSide = false
  )

  val ScrollDepthSwitch = Switch(
    "Monitoring",
    "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val CssLogging = Switch(
    "Monitoring",
    "css-logging",
    "If this is on, then a subset of clients will post css selector information for diagnostics.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  val ThirdPartyEmbedTracking = Switch(
    "Monitoring",
    "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    safeState = Off,
    never,
    exposeClientSide = true
  )

  // Features
  val DiscussionCrosswordsOptionalRelativeTimestampSwitch = Switch(
    "Feature",
    "discussion-crosswords-optional-relative-timestamp-switch",
    "Discussion optional relative timestamp in the crossword section",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 28),
    exposeClientSide = true
  )

  val OfflinePageSwitch = Switch(
    "Feature",
    "offline-page",
    "Offline page",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 16),
    exposeClientSide = true
  )

  val InternationalEditionSwitch = Switch(
    "Feature",
    "international-edition",
    "International edition A/B test on",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = true
  )

  val FixturesAndResultsContainerSwitch = Switch(
    "Feature",
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ChapterHeadingsSwitch = Switch(
    "Feature",
    "chapter-headings",
    "If this switch is turned on, we will add a block of chapter headings to the top of article pages",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 7),
    exposeClientSide = false
  )

  val NotificationsSwitch = Switch(
    "Feature",
    "notifications",
    "Notifications",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 15),
    exposeClientSide = true
  )

  val Hmtl5MediaCompatibilityCheck = Switch(
    "Feature",
    "html-5-media-compatibility-check",
    "If switched on then will will infer the video player tech priority based on the video source codec",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val OutbrainSwitch = Switch(
    "Feature",
    "outbrain",
    "Enable the Outbrain content recommendation widget.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val ForeseeSwitch = Switch(
    "Feature",
    "foresee",
    "Enable Foresee surveys for a sample of our audience",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val GeoMostPopular = Switch(
    "Feature",
    "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontSwitch = Switch(
    "Feature",
    "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontKerningSwitch = Switch(
    "Feature",
    "font-kerning",
    "If this is switched on then fonts will be kerned/optimised for legibility.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val SearchSwitch = Switch(
    "Feature",
    "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityProfileNavigationSwitch = Switch(
    "Feature",
    "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentitySocialOAuthSwitch = Switch(
    "Feature",
    "id-social-oauth",
    "If this switch is on then social sign-in attempts will be directed to Identity OAuth app, rather than the Webapp.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FacebookAutoSigninSwitch = Switch(
    "Feature",
    "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not " +
      "recently signed out are automatically signed in.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FacebookShareUseTrailPicFirstSwitch = Switch(
    "Feature",
    "facebook-shareimage",
    "Facebook shares try to use article trail picture image first when switched ON, or largest available " +
      "image when switched OFF.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityFormstackSwitch = Switch(
    "Feature",
    "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityAvatarUploadSwitch = Switch(
    "Feature",
    "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityCookieRefreshSwitch = Switch(
    "Identity",
    "id-cookie-refresh",
    "If switched on, users cookies will be refreshed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EnhanceTweetsSwitch = Switch(
    "Feature",
    "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EnhancedMediaPlayerSwitch = Switch(
    "Feature",
    "enhanced-media-player",
    "If this is switched on then videos are enhanced using our JavaScript player",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val MediaPlayerSupportedBrowsers = Switch(
    "Feature",
    "media-player-supported-browsers",
    "If this is switched on then a message will be displayed to UAs not supported by our media player",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val BreakingNewsSwitch = Switch(
    "Feature",
    "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val RugbyWorldCupswitch = Switch(
    "Feature",
    "rugby-world-cup",
    "If this switch is on rugby world cup scores will be loaded in to rugby match reports and liveblogs",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 6),
    exposeClientSide = true
  )

  val RugbyWorldCupMatchStatsSwitch = Switch(
    "Feature",
    "rugby-world-cup-match-stats",
    "If this switch is on rugby world cup stats will be loaded in to rugby match reports and liveblogs",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 6),
    exposeClientSide = true
  )

  val RugbyWorldCupFriendlies = Switch(
    "Feature",
    "rugby-world-cup-friendlies-for-pre-prod",
    "If this switch is on rugby world cup scores will be load in Friendlies too (only use in CODE)",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 6),
    exposeClientSide = false
  )

  val RugbyWorldCupTablesSwitch = Switch(
    "Feature",
    "rugby-world-cup-tables",
    "If this switch is on rugby world cup tables will be loaded in to rugby match reports and liveblogs",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 6),
    exposeClientSide = true
  )

  val WeatherSwitch = Switch(
    "Feature",
    "weather",
    "If this is switched on then the weather component is displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val HistoryTags = Switch(
    "Feature",
    "history-tags",
    "If this is switched on then personalised history tags are shown in the meganav",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityBlockSpamEmails = Switch(
    "Feature",
    "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val QuizScoresService = Switch(
    "Feature",
    "quiz-scores-service",
    "If switched on, the diagnostics server will provide a service to store quiz results in memcached",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 1),
    exposeClientSide = false
  )

  val IdentityLogRegistrationsFromTor = Switch(
    "Feature",
    "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor exit node will be logged",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IPadNothrasherSwitch = Switch(
    "Feature",
    "ipad-no-thrashers",
    "This switch will disable Thrashers on ipads",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = true
  )

  val SplitOlderIPadsSwitch = Switch(
    "Feature",
    "ipad-split-capabilities",
    "If switched on then this gives older ipads the stripped down front but full articles",
    safeState = On,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = false
  )

  val SyndicationReprintEnabledSwitch = Switch (
    "Feature",
    "syndication-reprint-enabled",
    "Toggle on/off the syndication button on all pages (for desktop or above only)",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = true
  )

  // A/B Tests

  val ABLiveblogNotifications = Switch(
    "A/B Tests",
    "ab-liveblog-notifications",
    "Liveblog notifications",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 1),
    exposeClientSide = true
  )

  val ABMembershipMessageUk = Switch(
    "A/B Tests",
    "ab-membership-message-uk",
    "Switch for the UK Membership message A/B variants test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 21),
    exposeClientSide = true
  )

  val ABMembershipMessageUsa = Switch(
    "A/B Tests",
    "ab-membership-message-usa",
    "Switch for the USA Supporter message test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 21),
    exposeClientSide = true
  )

  val FootballFeedRecorderSwitch = Switch(
    "Feature",
    "football-feed-recorder",
    "If switched on then football matchday feeds will be recorded every minute",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CrosswordSvgThumbnailsSwitch = Switch(
    "Feature",
    "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SudokuSwitch = Switch(
    "Feature",
    "sudoku",
    "If switched on, sudokus will be available",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CricketScoresSwitch = Switch(
    "Feature",
    "cricket-scores",
    "If switched on, cricket score and scorecard link will be displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val StocksWidgetSwitch = Switch(
    "Feature",
    "stocks-widget",
    "If switched on, a stocks widget will be displayed on the business front",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val TwitterImageFallback = Switch(
    "Feature",
    "twitter-image-fallback",
    "If switched on, then the first image of a tweet will be included in the embed - it will only display at mobile breakpoints",
    safeState = On,
    sellByDate = new LocalDate(2015, 9, 30),
    exposeClientSide = false
  )

  val DiscussionAllPageSizeSwitch = Switch(
    "Feature",
    "discussion-all-page-size",
    "If this is switched on then users will have the option to load all comments",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MissingVideoEndcodingsJobSwitch = Switch(
    "Feature",
    "check-for-missing-video-encodings",
    "If this switch is switched on then the job will run which will check all video content for missing encodings",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val DiscussionProxySwitch = Switch(
    "Feature",
    "discussion-proxy",
    "in discussion/api.js it will use a proxy to post comments so http 1.0 users can still comment",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Facia

  val ToolDisable = Switch(
    "Facia",
    "facia-tool-disable",
    "If this is switched on then the fronts tool is disabled",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val ToolSparklines = Switch(
    "Facia",
    "facia-tool-sparklines",
    "If this is switched on then the fronts tool renders images from sparklines.ophan.co.uk",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolPressSwitch = Switch(
    "Facia",
    "facia-tool-press-front",
    "If this switch is on facia tool will press fronts on each change",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolDraftContent = Switch(
    "Facia",
    "facia-tool-draft-content",
    "If this switch is on facia tool will offer draft content to editors, and press draft fronts from draft content",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FaciaToolCachedContentApiSwitch = Switch(
    "Facia",
    "facia-tool-cached-capi-requests",
    "If this switch is on facia tool will cache responses from the content API and use them on failure",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitch = Switch(
    "Facia",
    "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val FrontPressJobSwitchStandardFrequency = Switch(
    "Facia",
    "front-press-job-switch-standard-frequency",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IphoneConfidence = Switch(
    "Performance",
    "iphone-confidence",
    "If this switch is on then some beacons will be dropped to gauge iPhone confidence",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val NoBounceIndicator = Switch(
    "Performance",
    "no-bounce-indicator",
    "If this switch is on then some beacons will be dropped to gauge if people move onto a new piece of content before Omniture runs",
    safeState = On,
    sellByDate = new LocalDate(2016, 1, 10),
    exposeClientSide = true
  )

  val FaciaPressOnDemand = Switch(
    "Facia",
    "facia-press-on-demand",
    "If this is switched on, you can force facia to press on demand (Leave off)",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  // Server-side A/B Tests
  val ServerSideTests = {
    // It's for the side effect. Blame agents.
    val tests = mvt.ActiveTests.tests

    Switch(
      "Server-side A/B Tests",
      "server-side-tests",
      "Enables the server side testing system",
      safeState = Off,
      sellByDate = never,
      exposeClientSide = false
    )
  }

  def all: Seq[SwitchTrait] = Switch.allSwitches

  def grouped: List[(String, Seq[SwitchTrait])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1)
  }
}
