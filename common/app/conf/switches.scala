package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import implicits.Collections
import play.api.{Application, Plugin}
import play.api.libs.ws.WS
import org.joda.time.DateMidnight

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
}

object Switches extends Collections {

  // Switch names can be letters numbers and hyphens only

  private lazy val never = new DateMidnight(2100, 1, 1)
  private lazy val endOfQ4 = new DateMidnight(2014, 4, 1)

  // Load Switches

  val AutoRefreshSwitch = Switch("Performance Switches", "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off, sellByDate = never
  )

  val DogpileSwitch = Switch("Performance Switches", "dogpile",
    "If switched on this will enable the anti-dogpile cache, which will help absorb large spikes on single pieces of content e.g. live blogs",
    safeState = Off,

    //extended to end of March 2014 we will reevaluate once we see how successful it is with the pressed fronts
    sellByDate = new DateMidnight(2014, 3, 31)
  )

  val DoubleCacheTimesSwitch = Switch("Performance Switches", "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On, sellByDate = never
  )

  val RelatedContentSwitch = Switch("Performance Switches", "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On, sellByDate = endOfQ4
  )

  val CssFromStorageSwitch = Switch("Performance Switches", "css-from-storage",
    "If this switch is on CSS will be cached in users localStorage and read from there on subsequent requests.",
    safeState = Off, sellByDate = endOfQ4
  )

  val ElasticSearchSwitch = Switch("Performance Switches", "elastic-search-content-api",
    "If this switch is on then (parts of) the application will use the Elastic Search content api",
    safeState = On, sellByDate = never
  )

  val EditionRedirectLoggingSwitch = Switch("Performance Switches", "edition-redirect-logging",
    "If this switch is on, then extra logging will be done for edition redirects.",
    safeState = Off, sellByDate = endOfQ4
  )

  val ShowAllArticleEmbedsSwitch = Switch("Performance Switches", "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = On, sellByDate = never
  )

  // Advertising Switches

  val AdvertSwitch = Switch("Advertising", "adverts",
    "If this switch is on then OAS adverts will be loaded with JavaScript.",
    safeState = On, sellByDate = never
  )

  val VideoAdvertSwitch = Switch("Advertising", "video-adverts",
    "If this switch is on then OAS video adverts will be loaded with JavaScript.",
    safeState = Off, sellByDate = endOfQ4
  )

  // Commercial Tags

  val AudienceScienceSwitch = Switch("Commercial Tags", "audience-science",
    "If this switch is on the Audience Science will be enabled.",
    safeState = Off, sellByDate = endOfQ4)

  val ImrWorldwideSwitch = Switch("Commercial Tags", "imr-worldwide",
    "Enable the IMR Worldwide audience segment tracking.",
    safeState = Off, sellByDate = endOfQ4)

  val AmaaSwitch = Switch("Commercial Tags", "amaa",
    "Enable the AMAA audience segment tracking.",
    safeState = Off, sellByDate = endOfQ4)

  val EffectiveMeasureSwitch = Switch("Commercial Tags", "effective-measure",
    "Enable the Effective Measure audience segment tracking.",
    safeState = Off, sellByDate = endOfQ4)

  // Commercial Feeds

  val TravelOffersFeedSwitch = Switch("Commercial Feeds", "gu-travel-offers",
    "If this switch is on, commercial components will be fed by travel offer feed.",
    safeState = Off, sellByDate = endOfQ4)

  val JobFeedSwitch = Switch("Commercial Feeds", "gu-jobs",
    "If this switch is on, commercial components will be fed by job feed.",
    safeState = Off, sellByDate = endOfQ4)

  val MasterclassFeedSwitch = Switch("Commercial Feeds", "gu-masterclasses",
    "If this switch is on, commercial components will be fed by masterclass feed.",
    safeState = Off, sellByDate = endOfQ4)

  val SoulmatesFeedSwitch = Switch("Commercial Feeds", "gu-soulmates",
    "If this switch is on, commercial components will be fed by soulmates feed.",
    safeState = Off, sellByDate = endOfQ4)

  val MoneysupermarketFeedsSwitch = Switch("Commercial Feeds", "moneysupermarket",
    "If this switch is on, commercial components will be fed by Moneysupermarket feeds.",
    safeState = Off, sellByDate = endOfQ4)

  val LCMortgageFeedSwitch = Switch("Commercial Feeds", "lc-mortgages",
    "If this switch is on, commercial components will be fed by London & Country mortgage feed.",
    safeState = Off, sellByDate = endOfQ4)

  val GuBookshopFeedsSwitch = Switch("Commercial Feeds", "gu-bookshop",
    "If this switch is on, commercial components will be fed by the Guardian Bookshop feed.",
    safeState = Off, sellByDate = endOfQ4)


  // Analytics Switches

  val LiveStatsSwitch = Switch("Analytics", "live-stats",
    "Turns on our real-time KPIs",
    safeState = Off, sellByDate = endOfQ4
  )

  val LiveAbTestStatsSwitch = Switch("Analytics", "live-ab-test-stats",
    "Turns on our real-time ab test logging",
    safeState = Off, sellByDate = endOfQ4
  )

  val OphanSwitch = Switch("Analytics", "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On, never
  )

  val DiagnosticsRequestLogging = Switch("Diagnostics", "enable-diagnostics-request-logging",
    "If this switch is on, then requests to the Diagnostics servers will be logged.",
    safeState = Off, endOfQ4
  )

  val DiagnosticsJavascriptErrorLogging = Switch("Diagnostics", "enable-diagnostics-js-error-logging",
    "If this switch is on, then js error reports sent to the Diagnostics servers will be logged.",
    safeState = Off, endOfQ4
  )

  val ScrollDepthSwitch = Switch("Analytics", "scroll-depth",
    "Enables tracking and measurement of scroll depth",
    safeState = Off, never
  )

  // Discussion Switches

  val DiscussionSwitch = Switch("Discussion", "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = Off, sellByDate = never
  )

  val DiscussionVerifiedEmailPosting = Switch("Discussion", "discussion-verified-email-posting",
    "If this switch is on, posters to discussions must have a verified email address.",
    safeState = Off, sellByDate = endOfQ4
  )

  // Identity Switches

  val IdentityEmailVerificationSwitch = Switch("Identity Email verification", "id-email-verification",
    "If this switch is on, the option to resend your verification email is displayed.",
    safeState = Off, sellByDate = endOfQ4
  )

  // Open

  val OpenCtaSwitch = Switch("Open", "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side. Turn this off if the Open API is blowing up.",
    safeState = Off, sellByDate = never
  )

  // Feature Switches
  val ReleaseMessageSwitch = Switch("Feature Switches", "release-message",
    "If this is switched on users will be messaged that they are inside the alpha/beta/whatever release",
    safeState = Off, sellByDate = endOfQ4
  )

  val FontSwitch = Switch("Feature Switches", "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = Off, sellByDate = endOfQ4
  )

  val SponsoredContentSwitch = Switch("Feature Switches", "sponsored-content",
    "If this is switched on the articles will display a simple 'Advertisement feature' notice.",
    safeState = Off, sellByDate = endOfQ4
  )

  val SocialSwitch = Switch("Feature Switches", "social-icons",
    "Enable the social media share icons (Facebook, Twitter etc.)",
    safeState = Off, sellByDate = endOfQ4
  )

  val SearchSwitch = Switch("Feature Switches", "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = Off, sellByDate = endOfQ4
  )

  val LightboxGalleriesSwitch = Switch("Feature Switches", "lightbox-galleries",
    "If this switch is on, galleries open in a lightbox.",
    safeState = On, sellByDate = endOfQ4
  )

  val IdentityProfileNavigationSwitch = Switch("Feature Switches", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On, sellByDate = endOfQ4
  )

  val ExternalLinksCardsSwitch = Switch("Feature Switches", "external-links-cards",
    "If this switch is on, external links are turned into cards in body content on wide viewports.",
    safeState = Off,

    sellByDate = new DateMidnight(2014, 3, 7)
  )

  val ArticleKeywordsSwitch = Switch("Feature Switches", "article-keywords",
    "If this is switched on then keywords will be shown at the end of articles.",
    safeState = On, sellByDate = endOfQ4
  )

  val ClientSideErrorSwitch = Switch("Feature Switches", "client-side-errors",
    "If this is switch on the the browser will log JavaScript errors to the server (via a beacon)",
    safeState = Off, sellByDate = endOfQ4
  )

  val FacebookAutoSigninSwitch = Switch("Feature Switches", "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not recently signed out are automatically signed in.",
    safeState = Off, sellByDate = endOfQ4
  )

  val IdentityFormstackSwitch = Switch("Feature Switches", "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off, sellByDate = never
  )

  val RightHandMostPopularSwitch = Switch("Feature Switches", "right-hand-most-popular",
    "If this switch is on, a component with most popular content from around the Guardian is displayed in the article right hand column at desktop breakpoints.",
    safeState = On, sellByDate = endOfQ4
  )

  val IdentityEthicalAwardsSwitch = Switch("Feature Switches", "id-ethical-awards",
    "If this switch is on, Ethical awards forms will be available",
    safeState = Off, sellByDate = endOfQ4)

  val IdentityFilmAwardsSwitch = Switch("Feature Switches", "id-film-awards",
    "If this switch is on, Film awards forms will be available",
    safeState = Off, sellByDate = endOfQ4)

  val NetworkFrontOptIn = Switch("Feature Switches", "network-front-opt-in",
    "If this is switched on then an opt-in message will be displayed to users coming from the R2 network front",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  val ArticleSlotsSwitch = Switch("Feature Switches", "article-slots",
    "If this switch is on, inline content slots (for stories, ads, etc) will be generated in article bodies",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  val DogeSwitch = Switch("Feature Switches", "doge",
    "Makes article headline Doge style",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 3)
  )

  val LayoutHintsSwitch = Switch("Feature Switches", "layout-hints",
    "If this switch is on, javascript will enable the inline-hinting css experiments",
    safeState = Off, sellByDate = new DateMidnight(2014, 4, 30)
  )

  // A/B Test Switches

  val ABAa = Switch("A/B Tests", "ab-abcd",
    "If this is switched on an AA test runs to prove the assignment of users in to segments is working reliably.",
    safeState = Off, sellByDate = endOfQ4
  )

  val ABRightHandRecommendations = Switch("A/B Tests", "ab-right-hand-recommendations",
    "Sets different recommendation providers against each other for the right hand component",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 7)
  )


  val ABRelatedContent = Switch("A/B Tests", "ab-onward-related",
    "If this switch is on the related content popular-in-tag override A/B test is run",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 10)
  )

  val TagLinking = Switch("Feature Switches", "tag-linking",
    "If this is switched on articles that have no in body links will auto link to their tags where possible",
    safeState = Off, sellByDate = endOfQ4
  )

  val GeoMostPopular = Switch("A/B Tests", "ab-geo-most-popular",
    "If this is switched on an A/B test runs to test if locally popular articles yield better click-through.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 14)
  )

  val ABUkContainers = Switch("A/B Tests", "ab-uk-containers",
    "If this is switched on an A/B test runs that tries a variation of the containers on the UK network front.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 8)
  )

  val ABUsContainers = Switch("A/B Tests", "ab-us-containers",
    "If this is switched on an A/B test runs that tries a variation of the containers on the US network front.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 12)
  )

  val ABAuContainers = Switch("A/B Tests", "ab-au-containers",
    "If this is switched on an A/B test runs that tries a variation of the containers on the AU network front.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 12)
  )

  val FootballTablePosition = Switch("A/B Tests", "ab-football-table-position",
    "If this switch is on, the football table will vary in position throughout the football tagged pages.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 7)
  )

  val ABFrontsLatestReviewsCard = Switch("A/B Tests", "ab-fronts-latest-reviews-card",
    "If this switch is on, AB test adding a 'Latest Reviews' card to the Features container on the front.",
    safeState = Off, sellByDate = new DateMidnight(2014, 3, 8)
  )

  // Sport Switch

  val LiveCricketSwitch = Switch("Live Cricket", "live-cricket",
    "If this is switched on the live cricket blocks are added to cricket articles, cricket tag and sport front.",
    safeState = Off, sellByDate = endOfQ4
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
    AdvertSwitch,
    VideoAdvertSwitch,
    AudienceScienceSwitch,
    DiscussionSwitch,
    DiscussionVerifiedEmailPosting,
    IdentityEmailVerificationSwitch,
    OpenCtaSwitch,
    FontSwitch,
    SocialSwitch,
    SearchSwitch,
    ReleaseMessageSwitch,
    IntegrationTestSwitch,
    ClientSideErrorSwitch,
    LightboxGalleriesSwitch,
    IdentityProfileNavigationSwitch,
    ExternalLinksCardsSwitch,
    LiveCricketSwitch,
    LiveStatsSwitch,
    LiveAbTestStatsSwitch,
    CssFromStorageSwitch,
    ElasticSearchSwitch,
    ArticleKeywordsSwitch,
    EditionRedirectLoggingSwitch,
    FacebookAutoSigninSwitch,
    IdentityFormstackSwitch,
    RightHandMostPopularSwitch,
    IdentityEthicalAwardsSwitch,
    IdentityFilmAwardsSwitch,
    ABAa,
    ABRightHandRecommendations,
    GeoMostPopular,
    FootballTablePosition,
    ABRelatedContent,
    ToolDisable,
    ToolConfigurationDisable,
    ToolSparklines,
    TagLinking,
    SponsoredContentSwitch,
    OphanSwitch,
    ScrollDepthSwitch,
    ContentApiPutSwitch,
    AmaaSwitch,
    EffectiveMeasureSwitch,
    ImrWorldwideSwitch,
    DiagnosticsRequestLogging,
    DiagnosticsJavascriptErrorLogging,
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
    DogpileSwitch,
    ShowAllArticleEmbedsSwitch,
    FrontPressJobSwitch,
    DogeSwitch,
    ABUkContainers,
    ABUsContainers,
    LayoutHintsSwitch,
    ABAuContainers,
    ABFrontsLatestReviewsCard
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

    refresh()
  }

  override def onStop() {
    Jobs.deschedule("SwitchBoardRefreshJob")
  }
}
