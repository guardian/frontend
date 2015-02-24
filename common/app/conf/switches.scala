package conf

import common._
import conf.Configuration.environment
import org.joda.time._
import play.api.Play.current
import play.api.libs.ws.WS
import play.api.{Application, Plugin}

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

trait SwitchTrait extends Switchable with Initializable[SwitchTrait] {
  val group: String
  val name: String
  val description: String
  val safeState: SwitchState
  val sellByDate: LocalDate

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

  Switch.switches.send(this :: _)
}

case class Switch(group: String,
                  name: String,
                  description: String,
                  safeState: SwitchState,
                  sellByDate: LocalDate
                   ) extends SwitchTrait

case class TimerSwitch(group: String,
                       name: String,
                       description: String,
                       safeState: SwitchState,
                       sellByDate: LocalDate,
                       activePeriods: Seq[Interval]
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

  private lazy val never = new LocalDate(2100, 1, 1)

  // Performance
  val LazyLoadContainersSwitch = Switch("Performance", "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    safeState = Off,
    sellByDate = new LocalDate(2015, 4, 1)
  )

  val TagPageSizeSwitch = Switch("Performance", "tag-page-size",
    "If this switch is on then we will request more items for larger tag pages",
    safeState = Off,
    sellByDate = never
  )

  val CircuitBreakerSwitch = Switch("Performance", "circuit-breaker",
    "If this switch is switched on then the Content API circuit breaker will be operational",
    safeState = Off,
    sellByDate = never
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

  val EnableOauthOnPreview = Switch("Performance", "enable-oauth-on-preview",
    "If this switch is switched on then the preview server requires login",
    safeState = On,
    sellByDate = new LocalDate(2015, 2, 26)
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

  val InlineCriticalCss = Switch("Performance", "inline-critical-css",
    "If this switch is on critical CSS will be inlined into the head of the document.",
    safeState = On, sellByDate = never
  )

  val AsyncCss = Switch("Performance", "async-css",
    "If this switch is on CSS will be loaded with media set to 'only x' and updated to 'all' when the stylesheet has loaded using javascript. Disabling it will use standard link elements.",
    safeState = On, sellByDate = never
  )

  val ShowAllArticleEmbedsSwitch = Switch("Performance", "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On, sellByDate = never
  )

  val ExternalVideoEmbeds = Switch("Performance", "external-video-embeds",
    "If switched on then we will accept and display external video views",
    safeState = Off, sellByDate = never
  )

  val DiscussionSwitch = Switch("Performance", "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = On, sellByDate = never
  )

  val DiscussionPageSizeSwitch = Switch("Performance", "discussion-page-size",
    "If this is switched on then users will have the option to change their discussion page size",
    safeState = Off, sellByDate = never
  )

  val DiscussionTimeoutSwitch = Switch("Performance", "discussion-timeout",
    "An experimental switch to investigate whether discussion calls should be timed out within 5000ms",
    safeState = Off, sellByDate = new LocalDate(2015, 2, 28)
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

  val VpaidAdvertsSwitch = Switch("Commercial", "vpaid-adverts",
    "Turns on support for vpaid-format adverts on videos.",
    safeState = Off, sellByDate = never
  )

  val SponsoredSwitch = Switch("Commercial", "sponsored",
    "Show sponsored badges, logos, etc.",
    safeState = On, sellByDate = never
  )

  val LiveblogAdvertsSwitch = Switch("Commercial", "liveblog-adverts",
    "Show inline adverts on liveblogs",
    safeState = Off, sellByDate = never
  )

  val AmaaSwitch = Switch("Commercial", "amaa",
    "AMAA tracking",
    safeState = Off, sellByDate = never)

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

  val KruxSwitch = Switch("Commercial", "krux",
    "Enable Krux Control Tag",
    safeState = Off, sellByDate = never)

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

  private def dateInFebruary(day: Int): Interval =
    new Interval(new DateTime(2015, 2, day, 0, 0, DateTimeZone.UTC), Days.ONE)

  val AppleAdNetworkFrontSwitch = Switch("Commercial", "apple-ads-on-network-front",
    "If this switch is on, Apple ads will appear on the network front during active periods.",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 1))

  val AppleAdCultureFrontSwitch = Switch("Commercial", "apple-ads-on-culture-front",
    "If this switch is on, Apple ads will appear on the culture front during active periods.",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 1))

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

  val CssLogging = Switch("Monitoring", "css-logging",
    "If this is on, then a subset of clients will post css selector information for diagnostics.",
    safeState = Off, never
  )

  val ThirdPartyEmbedTracking = Switch("Monitoring", "third-party-embed-tracking",
    "Enables tracking on our off-site third party embedded content. Such as: videos on embed.theguardian.com.",
    safeState = Off, never
  )

  // Features
  val CPScottSwitch = Switch(
    "Feature",
    "cp-scott-header",
    "CP Scott header on Comment is Free container",
    safeState = Off,
    sellByDate = new LocalDate(2015, 3, 1)
  )

  val FixturesAndResultsContainerSwitch = Switch(
    "Feature",
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    safeState = On,
    sellByDate = never
  )

  val HideInteractiveUi = Switch("Feature", "hide-interactive-ui",
    "If this is switched on interactives can be rendered without page furniture.",
    safeState = On, sellByDate = new LocalDate(2015, 2, 28)
  )

  val Hmtl5MediaCompatibilityCheck = Switch("Feature", "html-5-media-compatibility-check",
    "If switched on then will will infer the video player tech priority based on the video source codec",
    safeState = On, sellByDate = never)

  val OutbrainSwitch = Switch("Feature", "outbrain",
    "Enable the Outbrain content recommendation widget.",
    safeState = Off, sellByDate = never)

  val ForeseeSwitch = Switch("Feature", "foresee",
    "Enable Foresee surveys for a sample of our audience",
    safeState = Off, sellByDate = never)

  val ReleaseMessageSwitch = Switch("Feature", "release-message",
    "If this is switched on users will be messaged that they are inside the beta release",
    safeState = Off, sellByDate = new LocalDate(2015, 2, 28)
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
    safeState = On, sellByDate = never
  )

  val IdentityProfileNavigationSwitch = Switch("Feature", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On, sellByDate = never
  )

  val IdentitySocialOAuthSwitch = Switch("Feature", "id-social-oauth",
    "If this switch is on then social sign-in attempts will be directed to Identity OAuth app, rather than the Webapp.",
    safeState = Off, sellByDate = never
  )

  val FacebookAutoSigninSwitch = Switch("Feature", "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not recently signed out are automatically signed in.",
    safeState = Off, sellByDate = never
  )

  val FacebookShareUseTrailPicFirstSwitch = Switch("Feature", "facebook-shareimage",
    "Facebook shares try to use article trail picture image first when switched ON, or largest available image when switched OFF.",
    safeState = On, sellByDate = never
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

  val MediaPlayerSupportedBrowsers = Switch("Feature", "media-player-supported-browsers",
    "If this is switched on then a message will be displayed to UAs not supported by our media player",
    safeState = On, sellByDate = never
  )

  val BreakingNewsSwitch = Switch("Feature", "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    safeState = Off, sellByDate = never
  )

  val WeatherSwitch = Switch("Feature", "weather",
    "If this is switched on then the weather component is displayed",
    safeState = Off, sellByDate = never
  )

  val HistoryTags = Switch("Feature", "history-tags",
    "If this is switched on then personalised history tags are shown in the meganav",
    safeState = Off, sellByDate = never
  )

  val IdentityBlockSpamEmails = Switch("Feature", "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    safeState = On, sellByDate = never)
  // A/B Tests

  val IdentityLogRegistrationsFromTor = Switch("Feature", "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor esit node will be logged",
    safeState = On, sellByDate = never)

  val ABIdentityBenefits = Switch("A/B Tests", "ab-identity-benefits",
    "Switch for the Identity benefits A/B test.",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 31)
  )

  val ABHighCommercialComponent = Switch("A/B Tests", "ab-high-commercial-component",
    "Switch for the High Commercial Component A/B test.",
    safeState = Off, sellByDate = never
  )

  val ABKruxAudienceScience = Switch("A/B Tests", "ab-krux-audience-science",
    "Switch for the Krux/Audience Science A/B test.",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 6)
  )

  val FootballFeedRecorderSwitch = Switch("Feature", "football-feed-recorder",
    "If switched on then football matchday feeds will be recorded every minute",
    safeState = Off, sellByDate = never)

  val CrosswordSvgThumbnailsSwitch = Switch("Feature", "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    safeState = Off, sellByDate = never
  )

  val SudokuSwitch = Switch("Feature", "sudoku",
    "If switched on, sudokus will be available",
    safeState = Off, sellByDate = never
  )

  val CricketScoresSwitch = Switch("Feature", "cricket-scores",
    "If switched on, cricket score and scorecard link will be displayed",
    safeState = Off, sellByDate = never
  )

  val StocksWidgetSwitch = Switch("Feature", "stocks-widget",
    "If switched on, a stocks widget will be displayed on the business front",
    safeState = On, sellByDate = never
  )

  val DefaultOriginSwitch = Switch("Feature", "default-origin",
    "If switched on, an experimental default header to allow origins will be added to Json endpoints",
    safeState = On, sellByDate = new LocalDate(2015, 2, 28)
  )

  val DiscussionAllPageSizeSwitch = Switch("Feature", "discussion-all-page-size",
    "If this is switched on then users will have the option to load all comments",
    safeState = Off, sellByDate = never
  )

  val MissingVideoEndcodingsJobSwitch = Switch("Feature", "check-for-missing-video-encodings",
    "If this switch is switched on then the job will run which will check all video content for missing encodings",
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
    safeState = On, sellByDate = never
  )

  val FaciaToolCachedContentApiSwitch = Switch("Facia", "facia-tool-cached-capi-requests",
    "If this switch is on facia tool will cache responses from the content API and use them on failure",
    safeState = On, sellByDate = never
  )

  val FaciaToolSaveClipboardOftenSwitch = Switch("Facia", "facia-tool-save-clipboard-often",
    "If this switch is on facia tool will save the state of the clipboard every 2 seconds",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 31)
  )

  val FaciaToolSaveClipboardSeldomSwitch = Switch("Facia", "facia-tool-save-clipboard-seldom",
    "If this switch is on facia tool will save the state of the clipboard every 5 seconds",
    safeState = Off, sellByDate = new LocalDate(2015, 3, 31)
  )

  val FrontPressJobSwitch = Switch("Facia", "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off, sellByDate = never
  )

  val FaciaTreats = Switch("Facia", "facia-treats",
    "If this switch is on then treats will be available to edit in the tool and will be pressed",
    safeState = Off, sellByDate = never
  )

  val IphoneConfidence = Switch("Performance", "iphone-confidence",
    "If this switch is on then some beacons will be dropped to gauge iPhone confidence",
    safeState = Off, sellByDate = new LocalDate(2015, 2, 28)
  )

  val DoNotTrack = Switch("Analytics", "do-not-track",
    "If this switch is on then we will count the number of people with do not track headers (yes, yes, I know)",
    safeState = Off, sellByDate = new LocalDate(2015, 2, 28)
  )

  val FaciaDynamoArchive = Switch("Facia", "facia-tool-dynamo-archive",
    "If this switch is on, facia-tool will directly archive to DynamoDB. When this is about to expire, please check the DB size.",
    safeState = Off, sellByDate = new LocalDate(2015, 8, 31)
  )

  def all: Seq[SwitchTrait] = Switch.allSwitches

  def grouped: List[(String, Seq[SwitchTrait])] = {
    val sortedSwitches = all.groupBy(_.group).map { case (key, value) => (key, value.sortBy(_.name)) }
    sortedSwitches.toList.sortBy(_._1)
  }
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
