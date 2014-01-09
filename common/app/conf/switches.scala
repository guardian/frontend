package conf

import com.gu.management.{ DefaultSwitch, Switchable }
import common._
import implicits.Collections
import play.api.Plugin
import play.api.libs.ws.WS

sealed trait SwitchState
case object On extends SwitchState
case object Off extends SwitchState

case class Switch(group: String, name: String, description: String, safeState: SwitchState) extends Switchable {
  val delegate = DefaultSwitch(name, description, initiallyOn = safeState == On)

  def isSwitchedOn: Boolean = delegate.isSwitchedOn

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


  // Load Switches

  val AutoRefreshSwitch = Switch("Performance Switches", "auto-refresh",
    "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load.",
    safeState = Off)

  val DoubleCacheTimesSwitch = Switch("Performance Switches", "double-cache-times",
    "Doubles the cache time of every endpoint. Turn on to help handle exceptional load.",
    safeState = On)

  val RelatedContentSwitch = Switch("Performance Switches", "related-content",
    "If this switch is turned on then related content will show. Turn off to help handle exceptional load.",
    safeState = On)

  val CssFromStorageSwitch = Switch("Performance Switches", "css-from-storage",
    "If this switch is on CSS will be cached in users localStorage and read from there on subsequent requests.",
    safeState = Off)

  val ElasticSearchSwitch = Switch("Performance Switches", "elastic-search-content-api",
    "If this switch is on then (parts of) the application will use the Elastic Search content api",
    safeState = On)

  val EditionRedirectLoggingSwitch = Switch("Performance Switches", "edition-redirect-logging",
    "If this switch is on, then extra logging will be done for edition redirects.",
    safeState = Off
  )

  // Advertising Switches

  val AdvertSwitch = Switch("Advertising", "adverts",
    "If this switch is on then OAS adverts will be loaded with JavaScript.",
    safeState = On)

  val VideoAdvertSwitch = Switch("Advertising", "video-adverts",
    "If this switch is on then OAS video adverts will be loaded with JavaScript.",
    safeState = Off)

  val iPhoneAppSwitch = Switch("Advertising", "iphone-app",
    "If this switch is on then the iPhone app upsell will be enabled.",
    safeState = Off)


  // Analytics Switches

  val AudienceScienceSwitch = Switch("Analytics", "audience-science",
    "If this switch is on the Audience Science will be enabled.",
    safeState = Off)

  val AdDwellTimeLoggerSwitch = Switch("Analytics", "ad-dwell-times-logging",
    "If this is on the in-view advert tracker will log some data to the Play logs",
    safeState = On)

  val QuantcastSwitch = Switch("Analytics", "quantcast",
    "Enable the Quantcast audience segment tracking.",
    safeState = Off)

  val AdSlotImpressionStatsSwitch = Switch("Analytics", "adslot-impression-stats",
    "Track when adslots (and possible ad slots) are scrolled into view.",
    safeState = Off)

  val LiveStatsSwitch = Switch("Analytics", "live-stats",
    "Turns on our real-time KPIs",
    safeState = On)

  val UserzoomSwitch = Switch("Analytics", "userzoom",
    "Turns on userzoom survey popups",
    safeState = Off)

  val OphanMultiEventSwitch = Switch("Analytics", "ophan-multi-event",
    "Enables the new Ophan tracking javascript which support multiple events per page",
    safeState = Off)

  // Discussion Switches

  val DiscussionSwitch = Switch("Discussion", "discussion",
    "If this switch is on, comments are displayed on articles.",
    safeState = Off)

  val DiscussionCommentRecommend = Switch("Discussion", "discussion-comment-recommend",
    "If this switch is on, users can recommend comments",
    safeState = Off)

  val DiscussionPostCommentSwitch = Switch("Discussion", "discussion-post-comment",
    "If this switch is on, users will be able to post comments",
    safeState = Off)

  val DiscussionTopCommentsSwitch = Switch("Discussion", "discussion-top-comments",
    "If this switch is on, users will see top comments if there are any",
    safeState = Off)

  // Open

  val OpenCtaSwitch = Switch("Open", "open-cta",
    "If this switch is on, will see a CTA to comments on the right hand side",
    safeState = Off)


  // Swipe Switches

  val SwipeNav = Switch("Swipe Navigation", "swipe-nav",
    "If this switch is on then swipe navigation is enabled.",
    safeState = Off)

  val SwipeNavOnClick = Switch("Swipe Navigation", "swipe-nav-on-click",
    "If this switch is also on then swipe navigation on clicks is enabled.",
    safeState = Off)

  // Feature Switches

  val ReleaseMessageSwitch = Switch("Feature Switches", "release-message",
    "If this is switched on users will be messaged that they are inside the alpha/beta/whatever release",
    safeState = Off)

  val FontSwitch = Switch("Feature Switches", "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = Off)

  val SponsoredContentSwitch = Switch("Feature Switches", "sponsored-content",
    "If this is switched on the articles will display a simple 'Advertisement feature' notice.",
    safeState = Off)

  val NetworkFrontAppealSwitch = Switch("Feature Switches", "network-front-appeal",
    "Switch to show the appeal trailblock on the network front.",
    safeState = Off)

  val WitnessVideoSwitch = Switch("Feature Switches", "witness-video",
    "Switch this switch off to disable witness video embeds.",
    safeState = Off)

  val SocialSwitch = Switch("Feature Switches", "social-icons",
    "Enable the social media share icons (Facebook, Twitter etc.)",
    safeState = Off)

  val SearchSwitch = Switch("Feature Switches", "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = Off)

  val AustraliaFrontSwitch = Switch("Feature Switches", "australia-front",
    "If this switch is on the australia front will be available. Otherwise it will 404.",
    safeState = Off)

  val LocalNavSwitch = Switch("Feature Switches", "local-nav",
    "If this switch is on, a secondary local nav is shown.",
    safeState = Off)

  val LightboxGalleriesSwitch = Switch("Feature Switches", "lightbox-galleries",
    "If this switch is on, galleries open in a lightbox.",
    safeState = On)

  val IdentityProfileNavigationSwitch = Switch("Feature Switches", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On)

  val ExternalLinksCardsSwitch = Switch("Feature Switches", "external-links-cards",
    "If this switch is on, external links are turned into cards in body content on wide viewports.",
    safeState = Off)

  val LiveSummarySwitch = Switch("Feature Switches", "live-summary",
    "If this is switched on the live events will show a summary at the beginning of the page on mobile next to the article on wider devices.",
    safeState = Off)

  val ShowUnsupportedEmbedsSwitch = Switch("Feature Switches", "unsupported-embeds",
    "If this is switched on then unsupported embeds will be included in article bodies.",
    safeState = Off)

  val ArticleKeywordsSwitch = Switch("Feature Switches", "article-keywords",
    "If this is switched on then keywords will be shown at the end of articles.",
    safeState = On)

  val ClientSideErrorSwitch = Switch("Feature Switches", "client-side-errors",
    "If this is switch on the the browser will log JavaScript errors to the server (via a beacon)",
    safeState = Off)

  val FacebookAutoSigninSwitch = Switch("Feature Switches", "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not recently signed out are automatically signed in.",
    safeState = Off)

  val IdentityFormstackSwitch = Switch("Feature Switches", "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off)

  val IdentityEthicalAwardsSwitch = Switch("Feature Switches", "id-ethical-awards",
    "If this switch is on, Ethical awards forms will be available",
    safeState = Off)

  val IdentityFilmAwardsSwitch = Switch("Feature Switches", "id-film-awards",
    "If this switch is on, Film awards forms will be available",
    safeState = Off)

  // A/B Test Switches

  val ABAa = Switch("A/B Tests", "ab-abcd",
    "If this is switched on an AA test runs to prove the assignment of users in to segments is working reliably.",
    safeState = Off)

  val ABAlphaComm = Switch("A/B Tests", "ab-alpha-comm",
    "If this is switched on an AB test runs to trial new advertising user experiences and commercial models",
    safeState = Off)

  val ABCommercialInArticleDesktop = Switch("A/B Tests", "ab-commercial-in-articles-desktop",
    "If this is on an AB test inserts commercial components in the inline and MPU advert slots (scope to desktop)",
    safeState = Off)

  val ABCommercialInArticleMobile = Switch("A/B Tests", "ab-commercial-in-articles-mobile",
    "If this is on an AB test inserts commercial components in the inline and MPU advert slots (scope to mobile browsers)",
    safeState = Off)

  val ABMobileFacebookAutosignin = Switch("A/B Tests", "ab-mobile-facebook-autosignin",
    "If this is switched on an AB test runs to test facebook autosignin for mobile users",
   safeState = Off)

  val ABOnwardIntrusive = Switch("A/B Tests", "ab-onward-intrusive",
    "If this is switched on an AB test runs to test intrusive onward components",
    safeState = Off)

  val ABOnwardHighlightsPanel = Switch("A/B Tests", "ab-onward-highlights-panel",
    "If this is switched on an AB test runs to test onward highlights panel",
    safeState = Off)

  val ABEmailSignup = Switch("A/B Tests", "ab-email-signup",
    "If this is switched on an AB test runs to test article page email signups",
    safeState = Off)

  val ABRightPopular = Switch("A/B Tests", "ab-right-popular",
    "If this is switched on an AB test runs to trail a right hand side most popular component",
    safeState = Off)

  val ABRightPopularControl = Switch("A/B Tests", "ab-right-popular-control",
    "If this is switched on an AB test runs as a control variant for right most popular",
    safeState = Off)

  val TagLinking = Switch("Feature Switches", "tag-linking",
    "If this is switched on articles that have no in body links will auto link to their tags where possible",
    safeState = Off)

  val ABUnderlineLinks = Switch("A/B Tests", "ab-underline-links",
    "If this is switched on an AB test runs whereby links in articles are underline (with CSS)",
    safeState = Off)

  // Sport Switch

  val LiveCricketSwitch = Switch("Live Cricket", "live-cricket",
    "If this is switched on the live cricket blocks are added to cricket articles, cricket tag and sport front.",
    safeState = Off)

  // Dummy Switch

  val IntegrationTestSwitch = Switch("Unwired Test Switch", "integration-test-switch",
    "Switch that is only used while running tests. You never need to change this switch.",
    safeState = Off)

  val NetworkFrontUkAlpha = Switch("Facia", "network-front-uk-alpha",
    "If this is switched on then the uk alpha network fronts will be served if a GU_UK_ALPHA cookie has been dropped",
    safeState = Off
  )

  val NetworkFrontUsAlpha = Switch("Facia", "network-front-us-alpha",
    "If this is switched on then the us alpha network fronts will be served if a GU_US_ALPHA cookie has been dropped",
    safeState = Off
  )

  val NetworkFrontAuAlpha = Switch("Facia", "network-front-au-alpha",
    "If this is switched on then the au alpha network fronts will be served if a GU_AU_ALPHA cookie has been dropped",
    safeState = Off
  )

  // Image Switch

  val ServeWebPImagesSwitch = Switch("Image Server", "serve-webp-images",
    "If this is switched on the Image server will use the webp format when requested.",
    safeState = On)

  val ImageServerSwitch = Switch("Image Server", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = On)

  val all: List[Switch] = List(
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    AdvertSwitch,
    VideoAdvertSwitch,
    AudienceScienceSwitch,
    QuantcastSwitch,
    DiscussionSwitch,
    DiscussionPostCommentSwitch,
    DiscussionTopCommentsSwitch,
    OpenCtaSwitch,
    SwipeNav,
    SwipeNavOnClick,
    FontSwitch,
    NetworkFrontAppealSwitch,
    WitnessVideoSwitch,
    SocialSwitch,
    SearchSwitch,
    ImageServerSwitch,
    ReleaseMessageSwitch,
    AustraliaFrontSwitch,
    IntegrationTestSwitch,
    iPhoneAppSwitch,
    ClientSideErrorSwitch,
    LocalNavSwitch,
    LightboxGalleriesSwitch,
    IdentityProfileNavigationSwitch,
    ExternalLinksCardsSwitch,
    LiveSummarySwitch,
    LiveCricketSwitch,
    LiveStatsSwitch,
    UserzoomSwitch,
    AdSlotImpressionStatsSwitch,
    CssFromStorageSwitch,
    ElasticSearchSwitch,
    ShowUnsupportedEmbedsSwitch,
    ServeWebPImagesSwitch,
    ArticleKeywordsSwitch,
    EditionRedirectLoggingSwitch,
    FacebookAutoSigninSwitch,
    IdentityFormstackSwitch,
    ABAa,
    ABOnwardIntrusive,
    ABOnwardHighlightsPanel,
    ABAlphaComm,
    ABCommercialInArticleDesktop,
    ABCommercialInArticleMobile,
    ABRightPopularControl,
    ABMobileFacebookAutosignin,
    ABRightPopular,
    AdDwellTimeLoggerSwitch,
    ABEmailSignup,
    NetworkFrontUkAlpha,
    NetworkFrontUsAlpha,
    NetworkFrontAuAlpha,
    TagLinking,
    ABUnderlineLinks,
    SponsoredContentSwitch,
    OphanMultiEventSwitch
  )

  val grouped: List[(String, Seq[Switch])] = all.toList stableGroupBy { _.group }

  def byName(name: String): Option[Switch] = all.find(_.name.equals(name))
}


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
