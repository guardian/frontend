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
  def switchOn() { delegate.switchOn() }
  def switchOff() { delegate.switchOff() }
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
    safeState = Off)

  val ImageServerSwitch = Switch("Performance Switches", "image-server",
    "If this switch is on images will be served off i.guim.co.uk (dynamic image host).",
    safeState = Off)

  val CssFromStorageSwitch = Switch("Performance Switches", "css-from-storage",
    "If this switch is on CSS will be cached in users localStorage and read from there on subsequent requests.",
    safeState = Off)

  val ElasticSearchSwitch = Switch("Performance Switches", "elastic-search-content-api",
    "If this switch is on then (parts of) the application will use the Elastic Search content api",
    safeState = Off)

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

  val QuantcastSwitch = Switch("Analytics", "quantcast",
    "Enable the Quantcast audience segment tracking.",
    safeState = Off)

  val OmnitureDomReadySwitch = Switch("Analytics", "omniture-dom-ready",
    "Initialise Omniture on dom-ready, rather than on page-load.",
    safeState = Off)

  val AdSlotImpressionStatsSwitch = Switch("Analytics", "adslot-impression-stats",
    "Track when adslots (and possible ad slots) are scrolled into view.",
    safeState = Off)


  // Discussion Switches

  val DiscussionSwitch = Switch("Discussion", "discussion",
    "If this switch is on, comments are displayed on articles.",
    safeState = Off)

  val ShortDiscussionSwitch = Switch("Discussion", "short-discussion",
    "If this switch is on, only 10 top level comments are requested from discussion api.",
    safeState = Off)

  val DiscussionCommentRecommend = Switch("Discussion", "discussion-comment-recommend",
    "If this switch is on, users can recommend comments",
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
    "If this switch is on, gallery trails are opened in a lightbox.",
    safeState = Off)

  val IdentityProfileNavigationSwitch = Switch("Feature Switches", "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = Off)

  val ExternalLinksCardsSwitch = Switch("Feature Switches", "external-links-cards",
    "If this switch is on, external links are turned into cards in body content on wide viewports.",
    safeState = Off)

  val LiveSummarySwitch = Switch("Feature Switches", "live-summary",
    "If this is switched on the live events will show a summary at the beginning of the page on mobile next to the article on wider devices.",
    safeState = Off)

  // A/B Test Switches

  val FontDelaySwitch = Switch("A/B Tests", "web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    safeState = Off)

  val ABParagraphSpacingSwitch = Switch("A/B Tests", "ab-paragraph-spacing",
    "If this is switched on an AB test runs to measure the impact of macro typography tweaks on readability.",
    safeState = Off)

  val ABInlineLinkCardSwitch = Switch("A/B Tests", "ab-inline-link-card",
    "If this is switched on an AB test runs to measure the impact of cardifying inline links on number of linked stories read.",
    safeState = Off)

  val ABAa = Switch("A/B Tests", "ab-aa",
    "If this is switched on an AA test runs to prove the assignment of users in to segments is working reliably.",
    safeState = Off)

  val ABGalleryStyle = Switch("A/B Tests", "ab-gallery-style",
    "If this is switched on an AB test runs to trial the new gallery style vs the current design ",
    safeState = Off)

  val ABGalleryCta = Switch("A/B Tests", "ab-gallery-cta",
    "If this is switched on an AB test runs to test different styles of CTAs to launch a gallery",
    safeState = Off)

  val ABSwipeCtas = Switch("A/B Tests", "ab-swipe-ctas",
    "If this is switched on an AB test runs to trial the new swipe call to actions ",
    safeState = Off)

  val ABExpandableMostPopular = Switch("A/B Tests", "ab-expandable-most-popular",
    "If this is switched on an AB test runs to trial the impact of having expandable content in most popular trails",
    safeState = Off)

  val ABRightHandCard = Switch("A/B Tests", "ab-right-hand-card",
    "If this is switched on an AB test runs to trial the impact of having content cards in right hand column",
    safeState = Off)

  val ABLiveBlogShowMore = Switch("A/B Tests", "ab-live-blog-show-more",
    "If this is switched on an AB test runs to trial the impact of only displaying 10 live blog blocks with a show more cta",
    safeState = Off)

  val ABMostPopularFromFacebook = Switch("A/B Tests", "ab-most-popular-from-facebook",
    "If this is switched on an AB test runs to trial presenting visitors from Facebook with Most Popular from Facebook",
    safeState = Off)


  // Sport Switch

  val LiveCricketSwitch = Switch("Live Cricket", "live-cricket",
    "If this is switched on the live cricket blocks are added to cricket articles, cricket tag and sport front.",
    safeState = Off)

  // Dummy Switch

  val IntegrationTestSwitch = Switch("Unwired Test Switch", "integration-test-switch",
    "Switch that is only used while running tests. You never need to change this switch.",
    safeState = Off)

  val FaciaSwitch = Switch("Facia", "facia",
    "Switch to redirect to facia if request has X-Gu-Facia=true",
    safeState = Off
  )

  val FaciaLoadTestSwitch = Switch("Facia", "facia-load-test",
    "Switch to make an xhr request from all fronts to Facia, just to load-test it",
    safeState = Off
  )

  val all: List[Switch] = List(
    AutoRefreshSwitch,
    DoubleCacheTimesSwitch,
    RelatedContentSwitch,
    AdvertSwitch,
    VideoAdvertSwitch,
    AudienceScienceSwitch,
    QuantcastSwitch,
    OmnitureDomReadySwitch,
    DiscussionSwitch,
    ShortDiscussionSwitch,
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
    FontDelaySwitch,
    ABParagraphSpacingSwitch,
    ABInlineLinkCardSwitch,
    IntegrationTestSwitch,
    iPhoneAppSwitch,
    LocalNavSwitch,
    ABAa,
    LightboxGalleriesSwitch,
    IdentityProfileNavigationSwitch,
    ExternalLinksCardsSwitch,
    LiveSummarySwitch,
    LiveCricketSwitch,
    FaciaSwitch,
    FaciaLoadTestSwitch,
    AdSlotImpressionStatsSwitch,
    ABGalleryStyle,
    ABGalleryCta,
    ABSwipeCtas,
    ABExpandableMostPopular,
    ABRightHandCard,
    ABLiveBlogShowMore,
    CssFromStorageSwitch,
    ABMostPopularFromFacebook,
    ElasticSearchSwitch
  )

  val grouped: List[(String, Seq[Switch])] = all.toList stableGroupBy { _.group }
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
    Jobs.schedule("SwitchBoardRefreshJob", "0 * * * * ?", CommonApplicationMetrics.SwitchBoardLoadTimingMetric) {
      refresh()
    }

    refresh()
  }

  override def onStop() {
    Jobs.deschedule("SwitchBoardRefreshJob")
  }
}
