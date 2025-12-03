package conf.switches

import conf.switches.Expiry.never
import java.time.LocalDate
import conf.switches.Owner.group
import conf.switches.SwitchGroup.{Commercial, Feature}

trait FeatureSwitches {

  val ShareCounts = Switch(
    SwitchGroup.Feature,
    "server-share-counts",
    "If this switch is on, share counts are fetched from the Facebook Graph API on the server",
    owners = Seq(Owner.withGithub("jfsoul")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val FixturesAndResultsContainerSwitch = Switch(
    SwitchGroup.Feature,
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val FacebookShareImageLogoOverlay = Switch(
    SwitchGroup.Feature,
    "facebook-share-image-logo-overlay",
    "If this switch is turned on, we will overlay the guardian logo along the bottom of images shared on facebook",
    owners = Seq(Owner.withGithub("dominickendrick")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val TwitterShareImageLogoOverlay = Switch(
    SwitchGroup.Feature,
    "twitter-share-image-logo-overlay",
    "If this switch is turned on, we will overlay the guardian logo along the bottom of images shared on twitter",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val GeoMostPopular = Switch(
    SwitchGroup.Feature,
    "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val ExtendedMostPopular = Switch(
    SwitchGroup.Feature,
    "extended-most-popular",
    "Extended 'Most Popular' component with space for DPMUs",
    owners = group(Commercial),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val MostViewedFronts = Switch(
    SwitchGroup.Feature,
    "most-viewed-fronts",
    "If this is switched off, most viewed will not show on fronts",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val FontSwitch = Switch(
    SwitchGroup.Feature,
    "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val FontKerningSwitch = Switch(
    SwitchGroup.Feature,
    "font-kerning",
    "If this is switched on then fonts will be kerned/optimised for legibility.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val SearchSwitch = Switch(
    SwitchGroup.Feature,
    "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val IdentityProfileNavigationSwitch = Switch(
    SwitchGroup.Feature,
    "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val FacebookShareUseTrailPicFirstSwitch = Switch(
    SwitchGroup.Feature,
    "facebook-shareimage",
    "Facebook shares try to use article trail picture image first when switched ON, or largest available " +
      "image when switched OFF.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val IdentityAvatarUploadSwitch = Switch(
    SwitchGroup.Feature,
    "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val EnhanceTweetsSwitch = Switch(
    SwitchGroup.Feature,
    "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val HistoryTags = Switch(
    SwitchGroup.Feature,
    "history-tags",
    "If this is switched on then personalised history tags are shown in the meganav",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val IdentityBlockSpamEmails = Switch(
    SwitchGroup.Feature,
    "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val IdentityLogRegistrationsFromTor = Switch(
    SwitchGroup.Feature,
    "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor exit node will be logged",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val CrosswordSvgThumbnailsSwitch = Switch(
    SwitchGroup.Feature,
    "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val SudokuSwitch = Switch(
    SwitchGroup.Feature,
    "sudoku",
    "If switched on, sudokus will be available",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val CricketScoresSwitch = Switch(
    SwitchGroup.Feature,
    "cricket-scores",
    "If switched on, cricket score and scorecard link will be displayed",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val RugbyScoresSwitch = Switch(
    SwitchGroup.Feature,
    "rugby-world-cup",
    "If this switch is on rugby world cup scores will be loaded in to rugby match reports and liveblogs",
    owners = Seq(Owner.withName("health team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  // Decommissioned, see marker: 7dde429f00b1
  val StocksWidgetSwitch = Switch(
    SwitchGroup.Feature,
    "stocks-widget",
    "If switched on, a stocks widget will be displayed on the business front (note: code is currently decommissioned, so switch has no effect)",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val MissingVideoEndcodingsJobSwitch = Switch(
    SwitchGroup.Feature,
    "check-for-missing-video-encodings",
    "If this switch is switched on then the job will run which will check all video content for missing encodings",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val EmailInlineInFooterSwitch = Switch(
    SwitchGroup.Feature,
    "email-inline-in-footer",
    "show the email sign-up in the footer",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val UseAtomsSwitch = Switch(
    SwitchGroup.Feature,
    "use-atoms",
    "use atoms from content api to enhance content",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val AmpArticleSwitch = Switch(
    SwitchGroup.Feature,
    "amp-article-switch",
    "If this switch is on, link to amp pages will be in the metadata for articles",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val AmpLiveBlogSwitch = Switch(
    SwitchGroup.Feature,
    "amp-liveblog-switch",
    "If this switch is on, link to amp pages will be in the metadata for liveblogs",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val R2PagePressServiceSwitch = Switch(
    SwitchGroup.Feature,
    "r2-page-press-service",
    "When ON, the R2 page press service will monitor the queue and press pages to S3",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  // Owner: Maria Livia Chiorean
  val SmartAppBanner = Switch(
    SwitchGroup.Feature,
    "smart-app-banner",
    "When ON, show the Apple smart app banner by adding a meta tag",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  // Owner: Sam Cutler / Editorial Tools
  val Targeting = Switch(
    SwitchGroup.Feature,
    "targeting",
    "When ON will the targeting system will poll for updates and merge targeted campaigns into content",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val InlineEmailStyles = Switch(
    SwitchGroup.Feature,
    "inline-email-styles",
    "When ON, email styles will be stripped from the <head> and inlined into HTML style attributes",
    owners = Seq(Owner.withName("unknown")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val WeAreHiring = Switch(
    SwitchGroup.Feature,
    "we-are-hiring",
    "When ON, hiring messages will appear in browser console and HTML source",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val Acast = Switch(
    SwitchGroup.Feature,
    "acast",
    "When ON, requests to audio files will be routed to Acast if advertising is enabled",
    owners = Seq(Owner.withName("journalism team")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  // Simple & Coherent
  val ScAdFreeBanner = Switch(
    SwitchGroup.Feature,
    "sc-ad-free-banner",
    "If switched on, ad free users will be told they have ad free.",
    owners = Seq(Owner.withName("simple.and.coherent")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val slotBodyEnd = Switch(
    SwitchGroup.Feature,
    "slot-body-end",
    "If on, will populate body end slot from Slot Machine (note, only relevant to DCR for now)",
    owners = Seq(Owner.withEmail("slot.machine.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val remoteBanner = Switch(
    SwitchGroup.Feature,
    "remote-banner",
    "Enables the banner fetched from support-dotcom-components",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val remoteHeader = Switch(
    SwitchGroup.Feature,
    "remote-header",
    "Enables the header fetched from support-dotcom-components",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val InteractivePickerFeature = Switch(
    SwitchGroup.Feature,
    "interactive-picker",
    "Activate the Interactive Picker (routing interactives between frontend and DCR)",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val StickyVideos = Switch(
    SwitchGroup.Feature,
    "sticky-videos",
    "When ON, videos in liveblogs will 'stick' on the screen as the reader scrolls up and down the blog",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val NewsletterOnwards = Switch(
    SwitchGroup.Feature,
    "newsletter-onwards",
    "When ON, we replace the standard related stories onwards container with a dedicated one for Newsletters",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val KeyEventsCarousel = Switch(
    SwitchGroup.Feature,
    "key-events-carousel",
    "When ON, shows the new key events timeline carousel and hides the old key events timeline",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val AusRegionSelector = Switch(
    SwitchGroup.Feature,
    "aus-region-selector",
    "When ON, facia containers with targeted territories in Australia will include a 'region switcher' for users to change their region",
    owners = Seq(Owner.withName("unknown")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val Callout = Switch(
    SwitchGroup.Feature,
    "callouts",
    "When ON, shows the new callout block component",
    owners = Seq(Owner.withGithub("@guardian/editorial-experience")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val PersonaliseSignInGateAfterCheckout = Switch(
    SwitchGroup.Feature,
    "personalise-sign-in-gate-after-checkout",
    "When ON, the sign in gate shows a personalised message to subscribers and supporters",
    owners = Seq(Owner.withEmail("personalisation@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val DCRAudioPages = Switch(
    SwitchGroup.Feature,
    "dcr-audio-pages",
    "If this switch is on, we will render audio pages with DCR",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com"), Owner.withEmail("devx.e2e@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRVideoPages = Switch(
    SwitchGroup.Feature,
    "dcr-video-pages",
    "If this switch is on, we will render video pages with DCR",
    owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com"), Owner.withEmail("commercial.dev@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRTagPages = Switch(
    group = SwitchGroup.Feature,
    name = "dcr-tag-pages",
    description = "Render tag pages with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRCrosswords = Switch(
    SwitchGroup.Feature,
    "dcr-crosswords",
    "If this switch is on, crosswords will be rendered with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com"), Owner.withEmail("devx.e2e@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRFootballPages = Switch(
    SwitchGroup.Feature,
    "dcr-football-pages",
    "If this switch is on, live, fixtures and results football pages will be rendered with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRFootballMatchSummary = Switch(
    SwitchGroup.Feature,
    "dcr-football-match-summary",
    "If this switch is on, football match summary pages will be rendered with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRCricketPages = Switch(
    SwitchGroup.Feature,
    "dcr-cricket-pages",
    "If this switch is on, cricket scorecard pages will be rendered with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCRFootballTablesPages = Switch(
    SwitchGroup.Feature,
    "dcr-football-table-pages",
    "If this switch is on, football table pages will be rendered with DCR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val WomensEuro2025Atom = Switch(
    SwitchGroup.Feature,
    "womens-euro-2025-atom",
    "If this switch is on, the atom will be rendered on several football data pages",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val DCARGalleyPages = Switch(
    SwitchGroup.Feature,
    "dcar-gallery-pages",
    "If this switch is on, the gallery article will be rendered by DCAR",
    owners = Seq(Owner.withGithub("dotcom.platform@theguardian.com")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false,
    highImpact = false,
  )

  val EnableNewServerSideABTestsHeader = Switch(
    SwitchGroup.Feature,
    "enable-new-server-side-tests-header",
    "Enable new server-side AB tests header and add it to the vary header",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    sellByDate = never,
    safeState = Off,
    exposeClientSide = false,
    highImpact = false,
  )

  val GuardianLabsRedesign = Switch(
    SwitchGroup.Feature,
    "guardian-labs-redesign",
    "Shows the new style labs containers and cards",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    sellByDate = Some(LocalDate.of(2025, 12, 16)),
    safeState = Off,
    exposeClientSide = true,
    highImpact = false,
  )

  val ProductLeftColCards = Switch(
    SwitchGroup.Feature,
    "product-left-col-cards",
    "Enables product element summary cards to be shown in the left column at wide breakpoints",
    owners = Seq(Owner.withEmail("thefilter.dev@guardian.co.uk")),
    sellByDate = never,
    safeState = Off,
    exposeClientSide = true,
    highImpact = false,
  )

  val DCRHostedContent = Switch(
    group = SwitchGroup.Feature,
    name = "dcr-hosted-content",
    description = "Render hosted content pages with DCR",
    owners = Seq(Owner.withEmail("commercial.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = Some(LocalDate.of(2026, 4, 15)),
    exposeClientSide = false,
    highImpact = false,
  )

  val SignInGate = Switch(
    group = SwitchGroup.Feature,
    name = "sign-in-gate",
    description = "Enable sign-in gate on articles",
    owners = Seq(Owner.withEmail("value.dev@guardian.co.uk"), Owner.withEmail("growth.dev@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )

  val EnableHlsWeb = Switch(
    group = SwitchGroup.Feature,
    name = "enable-hls-web",
    description = "Enable HLS web streaming on web",
    owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true,
    highImpact = false,
  )
}
