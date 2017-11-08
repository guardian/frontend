package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FeatureSwitches {
  val ShareCounts = Switch(
    SwitchGroup.Feature,
    "server-share-counts",
    "If this switch is on, share counts are fetched from the Facebook Graph API on the server",
    owners = Seq(Owner.withGithub("jfsoul")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FixturesAndResultsContainerSwitch = Switch(
    SwitchGroup.Feature,
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FacebookShareImageLogoOverlay = Switch(
    SwitchGroup.Feature,
    "facebook-share-image-logo-overlay",
    "If this switch is turned on, we will overlay the guardian logo along the bottom of images shared on facebook",
    owners = Seq(Owner.withGithub("dominickendrick")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val TwitterShareImageLogoOverlay = Switch(
    SwitchGroup.Feature,
    "twitter-share-image-logo-overlay",
    "If this switch is turned on, we will overlay the guardian logo along the bottom of images shared on twitter",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val OutbrainSwitch = Switch(
    SwitchGroup.Feature,
    "outbrain",
    "Enable the Outbrain content recommendation widget on web and AMP.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val PlistaForOutbrainAU = Switch(
    SwitchGroup.Feature,
    "plista-for-outbrain-au",
    "Enable the Plista content recommendation widget to replace that of Outbrain for AU edition (for web only).",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val GeoMostPopular = Switch(
    SwitchGroup.Feature,
    "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontSwitch = Switch(
    SwitchGroup.Feature,
    "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontKerningSwitch = Switch(
    SwitchGroup.Feature,
    "font-kerning",
    "If this is switched on then fonts will be kerned/optimised for legibility.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val SearchSwitch = Switch(
    SwitchGroup.Feature,
    "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityProfileNavigationSwitch = Switch(
    SwitchGroup.Feature,
    "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FacebookShareUseTrailPicFirstSwitch = Switch(
    SwitchGroup.Feature,
    "facebook-shareimage",
    "Facebook shares try to use article trail picture image first when switched ON, or largest available " +
      "image when switched OFF.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityFormstackSwitch = Switch(
    SwitchGroup.Feature,
    "id-formstack",
    "If this switch is on, formstack forms will be available",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityAvatarUploadSwitch = Switch(
    SwitchGroup.Feature,
    "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityCookieRefreshSwitch = Switch(
    SwitchGroup.Identity,
    "id-cookie-refresh",
    "If switched on, users cookies will be refreshed.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityGdprMarketingConsentSwitch = Switch(
    SwitchGroup.Identity,
    "id-gdpr-marketing-consent",
    "If switched on, users will post GDPR compliant marketing consent from 'Edit Profile' page",
    owners = Seq(Owner.withGithub("mario-galic")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 1),
    exposeClientSide = false
  )

  val EnhanceTweetsSwitch = Switch(
    SwitchGroup.Feature,
    "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EnhancedVideoPlayerSwitch = Switch(
    SwitchGroup.Feature,
    "enhanced-video-player",
    "If this is switched on then videos are enhanced using our JavaScript player",
    owners = Seq(Owner.withGithub("siadcock")),
    safeState = On,
    sellByDate = new LocalDate(2018, 4, 30),
    exposeClientSide = true
  )

  val BreakingNewsSwitch = Switch(
    SwitchGroup.Feature,
    "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val WeatherSwitch = Switch(
    SwitchGroup.Feature,
    "weather",
    "If this is switched on then the weather component is displayed",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val HistoryTags = Switch(
    SwitchGroup.Feature,
    "history-tags",
    "If this is switched on then personalised history tags are shown in the meganav",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityBlockSpamEmails = Switch(
    SwitchGroup.Feature,
    "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityLogRegistrationsFromTor = Switch(
    SwitchGroup.Feature,
    "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor exit node will be logged",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val CrosswordSvgThumbnailsSwitch = Switch(
    SwitchGroup.Feature,
    "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SudokuSwitch = Switch(
    SwitchGroup.Feature,
    "sudoku",
    "If switched on, sudokus will be available",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CricketScoresSwitch = Switch(
    SwitchGroup.Feature,
    "cricket-scores",
    "If switched on, cricket score and scorecard link will be displayed",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val RugbyScoresSwitch = Switch(
    SwitchGroup.Feature,
    "rugby-world-cup",
    "If this switch is on rugby world cup scores will be loaded in to rugby match reports and liveblogs",
    owners = Seq(Owner.withName("health team")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val StocksWidgetSwitch = Switch(
    SwitchGroup.Feature,
    "stocks-widget",
    "If switched on, a stocks widget will be displayed on the business front",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val MissingVideoEndcodingsJobSwitch = Switch(
    SwitchGroup.Feature,
    "check-for-missing-video-encodings",
    "If this switch is switched on then the job will run which will check all video content for missing encodings",
    owners = Seq(Owner.withGithub("johnduffell")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val EmailInlineInFooterSwitch = Switch(
    SwitchGroup.Feature,
    "email-inline-in-footer",
    "show the email sign-up in the footer",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val UseAtomsSwitch = Switch(
    SwitchGroup.Feature,
    "use-atoms",
    "use atoms from content api to enhance content",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AmpArticleSwitch = Switch(
    SwitchGroup.Feature,
    "amp-article-switch",
    "If this switch is on, link to amp pages will be in the metadata for articles",
    owners = Seq(Owner.withGithub("NataliaLKB")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val AmpLiveBlogSwitch = Switch(
    SwitchGroup.Feature,
    "amp-liveblog-switch",
    "If this switch is on, link to amp pages will be in the metadata for liveblogs",
    owners = Seq(Owner.withGithub("NataliaLKB")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val R2PagePressServiceSwitch = Switch(
    SwitchGroup.Feature,
    "r2-page-press-service",
    "When ON, the R2 page press service will monitor the queue and press pages to S3",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val EmailInArticleSwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article",
    "When ON, the email sign-up form will show on articles matching the email lists utilising the email module",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

    // Owner: Frank Longden
  val ArticleBadgesSwitch = Switch(
    SwitchGroup.Feature,
    "article-header-badge",
    "When ON, articles specified in the badges file will have visual elements added",
    owners = Seq(Owner.withGithub("superfrank")),
    safeState = On,
    sellByDate = new LocalDate(2018, 1, 16),
    exposeClientSide = false
  )

  // Owner: Dotcom loyalty
  val EmailInArticleGtodaySwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article-gtoday",
    "When ON, the email sign-up form will show the Guardian today email sign-up on articles",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Dotcom loyalty
  val EmailInArticleOutbrainSwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article-outbrain",
    "When ON, we will check whether email sign-up will be shown and, if so, the outbrain non-compliant merchandising widget will be shown",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Dotcom habitual / Gareth
  val EmailSignupLabNotes = Switch(
    SwitchGroup.Feature,
    "email-signup-lab-notes",
    "When ON, insert the lab-notes email sign-up into Science section articles",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Dotcom habitual / Gareth
  val emailSignupEuRef = Switch(
    SwitchGroup.Feature,
    "email-signup-eu-ref",
    "When ON, insert the EU ref email sign-up into articles with the EU ref tag",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Maria Livia Chiorean
  val SmartAppBanner = Switch(
    SwitchGroup.Feature,
    "smart-app-banner",
    "When ON, show the Apple smart app banner by adding a meta tag",
    owners = Seq(Owner.withGithub("marialivia16")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Maria Livia Chiorean
  val SharingComments = Switch(
    SwitchGroup.Feature,
    "sharing-comments",
    "When ON, the user will be able to share comments",
    owners = Seq(Owner.withGithub("marialivia16")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Sam Cutler / Editorial Tools
  val Targeting = Switch(
    SwitchGroup.Feature,
    "targeting",
    "When ON will the targeting system will poll for updates and merge targeted campaigns into content",
    owners= Seq(Owner.withGithub("currysoup")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: George Haberis / Lindsey Dew
  val UseTailorEndpoints = Switch(
    SwitchGroup.Feature,
    "use-tailor-endpoints",
    "When ON will request data from tailor end points",
    owners= Seq(Owner.withGithub("GHaberis")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val InlineEmailStyles = Switch(
    SwitchGroup.Feature,
    "inline-email-styles",
    "When ON, email styles will be stripped from the <head> and inlined into HTML style attributes",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val YouTubePosterOverride = Switch(
    SwitchGroup.Feature,
    "youtube-poster-override",
    "When ON show trail image on YouTube atom playable content cards instead of the poster image",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  // Owner: Simple & Coherent
  val UkSupportFrontendActive = Switch(
    SwitchGroup.Feature,
    "uk-supporter-traffic-to-new-support-frontend",
    "When ON, all UK membership/contribute/support links send traffic to support.theguardian.com (aside from the banner)",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = On,
    sellByDate = new LocalDate(2018, 10, 17),
    exposeClientSide = true
  )

  val UsSupportFrontendActive = Switch(
    SwitchGroup.Feature,
    "us-supporter-traffic-to-new-support-frontend",
    "When ON, all US membership/contribute/support links send traffic to support.theguardian.com (aside from the banner)",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 10, 17),
    exposeClientSide = true
  )

  val ProfileShowContributorTab = Switch(
    SwitchGroup.Feature,
    "profile-show-contributor-tab",
    "When ON, the edit profile page will include a Contributions tab",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 11, 30),
    exposeClientSide = true
  )

  val PillarCards = Switch(
    SwitchGroup.Feature,
    "pillar-cards",
    "DO NOT ENABLE IN PROD – when ON, enables pillar cards",
    owners = Seq(Owner.withGithub("sndrs")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = false
  )

    // Owner: Journalism
  val ReaderAnswersDeliveryMechanism = Switch(
    SwitchGroup.Feature,
    "reader-answers-preferred-delivery-mechanism",
    "When ON, story questions will give readers the option to indicate their preferred answer delivery medium",
    owners = Seq(Owner.withGithub("annebyrne")),
    safeState = On,
    sellByDate = new LocalDate(2018, 10, 24),
    exposeClientSide = false
  )

  // This switch is just for the tag migration happening on 9/11/2017. Please delete this afterwards
  val GamesLinkSwitch = Switch(
    SwitchGroup.Feature,
    "games-link-switch",
    "When on, the link to games will be `/games`. When off, it will be `technology/games`",
    owners = Seq(Owner.withGithub("natalialkb")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 11, 13),
    exposeClientSide = false
  )
}
