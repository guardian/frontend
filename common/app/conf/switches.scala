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
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 28)
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

  val UserzoomSwitch = Switch("Analytics", "userzoom",
    "Turns on userzoom survey popups",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 15)
  )

  val OphanSwitch = Switch("Analytics", "ophan",
    "Enables the new Ophan tracking javascript",
    safeState = On, never
  )

  val OmnitureVerificationSwitch = Switch("Analytics", "omniture-verification",
    "Enables the new Ophan tracking javascript which support multiple events per page",
    safeState = Off, new DateMidnight(2014, 2, 28)
  )

  val DiagnosticsRequestLogging = Switch("Diagnostics", "enable-diagnostics-request-logging",
    "If this switch is on, then requests to the Diagnostics servers will be logged.",
    safeState = Off, endOfQ4
  )

  val DiagnosticsJavascriptErrorLogging = Switch("Diagnostics", "enable-diagnostics-js-error-logging",
    "If this switch is on, then js error reports sent to the Diagnostics servers will be logged.",
    safeState = Off, endOfQ4
  )

  // Discussion Switches

  val DiscussionSwitch = Switch("Discussion", "discussion",
    "If this switch is on, comments are displayed on articles. Turn this off if the Discussion API is blowing up.",
    safeState = Off, sellByDate = never
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

  val ShowAllArticleEmbedsSwitch = Switch("Feature Switches", "show-all-embeds",
    "If switched on then all embeds will be shown inside article bodies",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 28)
  )

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

  val LocalNavSwitch = Switch("Feature Switches", "local-nav",
    "If this switch is on, a secondary local nav is shown.",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 28)
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

    // WARNING - this has had one extension, no more.
    // if we cannot make a decision next time it goes
    sellByDate = new DateMidnight(2014, 2, 28)
  )

  val LiveSummarySwitch = Switch("Feature Switches", "live-summary",
    "If this is switched on the live events will show a summary at the beginning of the page on mobile next to the article on wider devices.",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 28)
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
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 15)
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

  // A/B Test Switches

  val ABAa = Switch("A/B Tests", "ab-abcd",
    "If this is switched on an AA test runs to prove the assignment of users in to segments is working reliably.",
    safeState = Off, sellByDate = endOfQ4
  )

  val ABEmailSignup = Switch("A/B Tests", "ab-email-signup",
    "If this is switched on an AB test runs to test article page email signups",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 14)
  )

  val ABGravityRecommendations = Switch("A/B Tests", "ab-gravity-recommendations",
    "Enables gravity beacon code on the site",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 24)
  )

  val TagLinking = Switch("Feature Switches", "tag-linking",
    "If this is switched on articles that have no in body links will auto link to their tags where possible",
    safeState = Off, sellByDate = endOfQ4
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

  // Facia

  val NetworkFrontUkAlpha = Switch("Facia", "network-front-uk-alpha",
    "If this is switched on then the uk alpha network fronts will be served if a GU_UK_ALPHA cookie has been dropped",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 13)
  )

  val NetworkFrontUsAlpha = Switch("Facia", "network-front-us-alpha",
    "If this is switched on then the us alpha network fronts will be served if a GU_US_ALPHA cookie has been dropped",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 13)
  )

  val NetworkFrontAuAlpha = Switch("Facia", "network-front-au-alpha",
    "If this is switched on then the au alpha network fronts will be served if a GU_AU_ALPHA cookie has been dropped",
    safeState = Off, sellByDate = new DateMidnight(2014, 2, 13)
  )

  // Facia Tool

  val ToolDisable = Switch("Facia Tool", "facia-tool-disable",
    "If this is switched on then the fronts tool is disabled",
    safeState = Off, sellByDate = never
  )

  val ToolSparklines = Switch("Facia Tool", "facia-tool-sparklines",
    "If this is switched on then the fronts tool renders images from sparklines.ophan.co.uk",
    safeState = Off, sellByDate = never
  )

  // Image Switch

  val ImageServerSwitch = Switch("Image Server", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On, sellByDate = never // this is a performance related switch, not a feature switch
  )

  // Facia Tool Switches

  val ContentApiPutSwitch = Switch("Facia Tool", "facia-tool-contentapi-put",
    "If this switch is on facia tool will PUT all collection changes to content api",
    safeState = Off, sellByDate = never
  )


  val all: List[Switch] = List(
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    AdvertSwitch,
    VideoAdvertSwitch,
    AudienceScienceSwitch,
    DiscussionSwitch,
    IdentityEmailVerificationSwitch,
    OpenCtaSwitch,
    FontSwitch,
    SocialSwitch,
    SearchSwitch,
    ReleaseMessageSwitch,
    IntegrationTestSwitch,
    ClientSideErrorSwitch,
    LocalNavSwitch,
    LightboxGalleriesSwitch,
    IdentityProfileNavigationSwitch,
    ExternalLinksCardsSwitch,
    LiveSummarySwitch,
    LiveCricketSwitch,
    LiveStatsSwitch,
    LiveAbTestStatsSwitch,
    UserzoomSwitch,
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
    ABGravityRecommendations,
    ABEmailSignup,
    NetworkFrontUkAlpha,
    NetworkFrontUsAlpha,
    NetworkFrontAuAlpha,
    ToolDisable,
    ToolSparklines,
    TagLinking,
    SponsoredContentSwitch,
    OphanSwitch,
    ContentApiPutSwitch,
    AmaaSwitch,
    ImrWorldwideSwitch,
    DiagnosticsRequestLogging,
    DiagnosticsJavascriptErrorLogging,
    OmnitureVerificationSwitch,
    TravelOffersFeedSwitch,
    JobFeedSwitch,
    MasterclassFeedSwitch,
    SoulmatesFeedSwitch,
    MoneysupermarketFeedsSwitch,
    LCMortgageFeedSwitch,
    GuBookshopFeedsSwitch,
    NetworkFrontOptIn,
    DogpileSwitch,
    ShowAllArticleEmbedsSwitch,

    ImageServerSwitch
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
