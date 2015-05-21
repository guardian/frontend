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

  def hasExpired = daysToExpiry == 0

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

  lazy val never = new LocalDate(2100, 1, 1)

  // Performance
  val LazyLoadContainersSwitch = Switch("Performance", "lazy-load-containers",
    "If this switch is on, containers past the 8th will be lazily loaded on mobile and tablet",
    safeState = Off,
    sellByDate = never
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
    sellByDate = new LocalDate(2015, 5, 31)
  )

  val PreviewAuthByCookie = Switch("Performance", "preview-auth-by-cookie",
    "If this switch is switched on then preview auth will be lengthened by a cookie",
    safeState = Off,
    sellByDate = new LocalDate(2015, 5, 31)
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

  val RichLinkSwitch = Switch("Performance", "rich-links",
    "If this switch is turned off then rich links will not be shown. Turn off to help handle exceptional load.",
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
    "If this switch is OFF, no calls will be made to the ad server. BEWARE!",
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

  val MembersAreaSwitch = Switch("Commercial", "gu-members-area",
    "If this switch is on, content flagged with membershipAccess will be protected",
    safeState = On,
    sellByDate = new LocalDate(2015, 8, 30)
  )

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

  val BookLookupSwitch = Switch("Commercial", "book-lookup",
    "If this switch is on, book data will be looked up using a third-party service.",
    safeState = Off, sellByDate = never)

  val AppleAdUkNetworkFrontSwitch = Switch("Commercial", "apple-ads-on-uk-network-front",
    "If this switch is on, Apple ads will appear below nav on the UK network front.",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 3))

  val AppleAdUsNetworkFrontSwitch = Switch("Commercial", "apple-ads-on-us-network-front",
    "If this switch is on, Apple ads will appear below nav on the US network front.",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 3))

  val AppleAdAuNetworkFrontSwitch = Switch("Commercial", "apple-ads-on-au-network-front",
    "If this switch is on, Apple ads will appear below nav on the AU network front.",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 3))

  val AppleAdTechFrontSwitch = Switch("Commercial", "apple-ads-on-tech-front",
    "If this switch is on, Apple ads will appear below nav on the tech section front.",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 3))

  val LazyLoadAds = Switch("Commercial", "lz-ads",
    "If switched on then all ads are lazy loaded",
    safeState = Off, sellByDate = never)

  val AdBlockMessage = Switch("Commercial", "adblock",
    "Switch for the Adblock Message.",
    safeState = Off, sellByDate = never)

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

  val FeedbackLink = Switch("Monitoring", "tech-feedback",
    "decide by now if it's worth keeping the link in the footer soliciting clicks for technical problems",
    safeState = Off, new LocalDate(2015, 8, 23)
  )


  // Features
  val ABTestHeadlines = Switch(
    "Feature",
    "a-b-test-headlines",
    "A/B test headlines",
    safeState = Off,
    sellByDate = new LocalDate(2015, 6, 1)
  )

  val InternationalEditionSwitch = Switch(
    "Feature",
    "international-edition",
    "International edition A/B test on",
    safeState = Off,
    sellByDate = new LocalDate(2015, 6, 1)
  )

  val FixturesAndResultsContainerSwitch = Switch(
    "Feature",
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    safeState = On,
    sellByDate = never
  )

  val ImgixSwitch = Switch("Feature", "imgix",
    "If this switch is on, then images will be served via the third party image resizing service Imgix.com",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 29)
  )

  val BecomeAMemberSwitch = Switch("Feature", "become-a-member",
    "If this switch is on the “Become a Member” button will be visible.",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 15)
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

  val QuizScoresService = Switch("Feature", "quiz-scores-service",
    "If switched on, the diagnostics server will provide a service to store quiz results in memcached",
    safeState = Off, sellByDate = new LocalDate(2015, 8, 16))

  val IdentityLogRegistrationsFromTor = Switch("Feature", "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor esit node will be logged",
    safeState = On, sellByDate = never)

  val LiveblogFrontUpdatesUk = Switch("Feature", "liveblog-front-updates-uk",
    "Switch for the latest liveblog updates on the UK network front",
    safeState = Off, sellByDate = never
  )

  val LiveblogFrontUpdatesUs = Switch("Feature", "liveblog-front-updates-us",
    "Switch for the latest liveblog updates on the US network front",
    safeState = Off, sellByDate = never
  )

  val LiveblogFrontUpdatesAu = Switch("Feature", "liveblog-front-updates-au",
    "Switch for the latest liveblog updates on the AU network front",
    safeState = Off, sellByDate = never
  )

  val LiveblogFrontUpdatesOther = Switch("Feature", "liveblog-front-updates-other",
    "Switch for the latest liveblog updates on non-network fronts",
    safeState = Off, sellByDate = never
  )

  // A/B Tests
  val ABStickyShares = Switch("A/B Tests", "ab-sticky-shares",
    "Switch sticky share buttons on articles",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 28)
  )

  val ABHighCommercialComponent = Switch("A/B Tests", "ab-high-commercial-component",
    "Switch for the High Commercial Component A/B test.",
    safeState = Off, sellByDate = never
  )

  val ABMtRec1 = Switch("A/B Tests", "ab-mt-rec1",
    "Viewability results - Recommendation option 1",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 25)
  )

  val ABMtRec2 = Switch("A/B Tests", "ab-mt-rec2",
    "Viewability results - Recommendation option 2",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 25)
  )

  val ABHeatmap = Switch("A/B Tests", "ab-heatmap",
    "Switch for the UK Network Front heatmap test.",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 24)
  )

  val ABSaveForLaterSwitch = Switch("A/B Tests", "ab-save-for-later",
    "It this switch is turned on, user are able to save article. Turn off if the identity API barfs" ,
    safeState = Off, sellByDate = never
  )

  val ABIdentityCookieRefresh = Switch("A/B Tests", "ab-cookie-refresh",
    "It this switch is turned on, users cookies will be refreshed. Turn off if the identity API barfs" ,
    safeState = Off, sellByDate = never
  )

  val ABLiveblogSportFrontUpdates = Switch("A/B Tests", "ab-liveblog-sport-front-updates",
    "Switch for the latest liveblog updates on sport & football fronts A/B test.",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 27)
  )

  val ABDeferSpacefinder = Switch("A/B Tests", "ab-defer-spacefinder",
    "A/B test to defer execution of spacefinder until images and richlinks have been loaded.",
    safeState = Off, sellByDate = new LocalDate(2015, 5, 25)
  )

  val ABHeadlineSwitches = (1 to 10) map { n =>
    Switch(
      "A/B Tests",
      s"ab-headline$n",
      s"Switch for headline $n",
      safeState = On,
      sellByDate = new LocalDate(2015, 6, 10)
    )
  }

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

  val FrontPressJobSwitch = Switch("Facia", "front-press-job-switch",
    "If this switch is on then the jobs to push and pull from SQS will run",
    safeState = Off, sellByDate = never
  )

  val IphoneConfidence = Switch("Performance", "iphone-confidence",
    "If this switch is on then some beacons will be dropped to gauge iPhone confidence",
    safeState = Off, sellByDate = never
  )

  val FaciaDynamoArchive = Switch("Facia", "facia-tool-dynamo-archive",
    "If this switch is on, facia-tool will directly archive to DynamoDB. When this is about to expire, please check the DB size.",
    safeState = Off, sellByDate = new LocalDate(2015, 8, 31)
  )

  val FaciaPressNewFormat = Switch("Facia", "facia-press-fapi-client-format",
    "If this switch is on, facia-press will press in the new fapi-client JSON format",
    safeState = Off, sellByDate = new LocalDate(2015, 8, 31)
  )

  val FaciaPressOnDemand = Switch("Facia", "facia-press-on-demand",
    "If this is switched on, you can force facia to press on demand (Leave off)",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 30)
  )

  val FaciaServerNewFormat = Switch("Facia", "facia-new-format",
    "If this is switched on, facia will serve off the new JSON format (It will fallback to old if it doesn't exist)",
    safeState = Off, sellByDate = new LocalDate(2015, 6, 30)
  )

  // Server-side A/B Tests
  val ServerSideTests = {
    // It's for the side effect. Blame agents.
    val tests = mvt.ActiveTests.tests

    Switch("Server-side A/B Tests", "server-side-tests",
      "Enables the server side testing system",
      safeState = Off, sellByDate = never)
  }

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
