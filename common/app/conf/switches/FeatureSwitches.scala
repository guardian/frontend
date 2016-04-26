package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FeatureSwitches {

  val FixturesAndResultsContainerSwitch = Switch(
    SwitchGroup.Feature,
    "fixtures-and-results-container",
    "Fixtures and results container on football tag pages",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val ChapterHeadingsSwitch = Switch(
    SwitchGroup.Feature,
    "chapter-headings",
    "If this switch is turned on, we will add a block of chapter headings to the top of article pages",
    safeState = Off,
    sellByDate = new LocalDate(2016, 11, 7),
    exposeClientSide = false
  )

  val OutbrainSwitch = Switch(
    SwitchGroup.Feature,
    "outbrain",
    "Enable the Outbrain content recommendation widget on web and AMP.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val PlistaForOutbrainAU = Switch(
    SwitchGroup.Feature,
    "plista-for-outbrain-au",
    "Enable the Plista content recommendation widget to replace that of Outbrain for AU edition (for web only).",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 5),
    exposeClientSide = true
  )

  val ForeseeSwitch = Switch(
    SwitchGroup.Feature,
    "foresee",
    "Enable Foresee surveys for a sample of our audience",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val GeoMostPopular = Switch(
    SwitchGroup.Feature,
    "geo-most-popular",
    "If this is switched on users then 'most popular' will be upgraded to geo targeted",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontSwitch = Switch(
    SwitchGroup.Feature,
    "web-fonts",
    "If this is switched on then the custom Guardian web font will load.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FontKerningSwitch = Switch(
    SwitchGroup.Feature,
    "font-kerning",
    "If this is switched on then fonts will be kerned/optimised for legibility.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val SearchSwitch = Switch(
    SwitchGroup.Feature,
    "google-search",
    "If this switch is turned on then Google search is added to the sections nav.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityProfileNavigationSwitch = Switch(
    SwitchGroup.Feature,
    "id-profile-navigation",
    "If this switch is on you will see the link in the topbar taking you through to the users profile or sign in..",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val FacebookAutoSigninSwitch = Switch(
    SwitchGroup.Feature,
    "facebook-autosignin",
    "If this switch is on then users who have previously authorized the guardian app in facebook and who have not " +
      "recently signed out are automatically signed in.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val FacebookShareUseTrailPicFirstSwitch = Switch(
    SwitchGroup.Feature,
    "facebook-shareimage",
    "Facebook shares try to use article trail picture image first when switched ON, or largest available " +
      "image when switched OFF.",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityFormstackSwitch = Switch(
    SwitchGroup.Feature,
    "id-formstack",
    "If this switch is on, formstack forms will be available",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityAvatarUploadSwitch = Switch(
    SwitchGroup.Feature,
    "id-avatar-upload",
    "If this switch is on, users can upload avatars on their profile page",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityCookieRefreshSwitch = Switch(
    SwitchGroup.Identity,
    "id-cookie-refresh",
    "If switched on, users cookies will be refreshed.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EnhanceTweetsSwitch = Switch(
    SwitchGroup.Feature,
    "enhance-tweets",
    "If this switch is turned on then embedded tweets will be enhanced using Twitter's widgets.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EnhancedMediaPlayerSwitch = Switch(
    SwitchGroup.Feature,
    "enhanced-media-player",
    "If this is switched on then videos are enhanced using our JavaScript player",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val MediaPlayerSupportedBrowsers = Switch(
    SwitchGroup.Feature,
    "media-player-supported-browsers",
    "If this is switched on then a message will be displayed to UAs not supported by our media player",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val BreakingNewsSwitch = Switch(
    SwitchGroup.Feature,
    "breaking-news",
    "If this is switched on then the breaking news feed is requested and articles are displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val WeatherSwitch = Switch(
    SwitchGroup.Feature,
    "weather",
    "If this is switched on then the weather component is displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val HistoryTags = Switch(
    SwitchGroup.Feature,
    "history-tags",
    "If this is switched on then personalised history tags are shown in the meganav",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val IdentityBlockSpamEmails = Switch(
    SwitchGroup.Feature,
    "id-block-spam-emails",
    "If switched on, any new registrations with emails from ae blacklisted domin will be blocked",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val IdentityLogRegistrationsFromTor = Switch(
    SwitchGroup.Feature,
    "id-log-tor-registrations",
    "If switched on, any user registrations from a known tor exit node will be logged",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val FootballFeedRecorderSwitch = Switch(
    SwitchGroup.Feature,
    "football-feed-recorder",
    "If switched on then football matchday feeds will be recorded every minute",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CrosswordSvgThumbnailsSwitch = Switch(
    SwitchGroup.Feature,
    "crossword-svg-thumbnails",
    "If switched on, crossword thumbnails will be accurate SVGs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val SudokuSwitch = Switch(
    SwitchGroup.Feature,
    "sudoku",
    "If switched on, sudokus will be available",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val CricketScoresSwitch = Switch(
    SwitchGroup.Feature,
    "cricket-scores",
    "If switched on, cricket score and scorecard link will be displayed",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val RugbyScoresSwitch = Switch(
    SwitchGroup.Feature,
    "rugby-world-cup",
    "If this switch is on rugby world cup scores will be loaded in to rugby match reports and liveblogs",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val StocksWidgetSwitch = Switch(
    SwitchGroup.Feature,
    "stocks-widget",
    "If switched on, a stocks widget will be displayed on the business front",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val DiscussionAllPageSizeSwitch = Switch(
    SwitchGroup.Feature,
    "discussion-all-page-size",
    "If this is switched on then users will have the option to load all comments",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val MissingVideoEndcodingsJobSwitch = Switch(
    SwitchGroup.Feature,
    "check-for-missing-video-encodings",
    "If this switch is switched on then the job will run which will check all video content for missing encodings",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val EmailInlineInFooterSwitch = Switch(
    SwitchGroup.Feature,
    "email-inline-in-footer",
    "show the email sign-up in the footer",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val UseAtomsSwitch = Switch(
    SwitchGroup.Feature,
    "use-atoms",
    "use atoms from content api to enhance content",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AmpSwitch = Switch(
    SwitchGroup.ServerSideABTests,
    "amp-switch",
    "If this switch is on, link to amp pages will be in the metadata for articles",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val R2PagePressServiceSwitch = Switch(
    SwitchGroup.Feature,
    "r2-page-press-service",
    "When ON, the R2 page press service will monitor the queue and press pages to S3",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val EmailInArticleSwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article",
    "When ON, the email sign-up form will show on articles matching the email lists utilising the email module",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val USElectionSwitch = Switch(
    SwitchGroup.Feature,
    "us-election",
    "When ON, items tagged with us-news/us-elections-2016 will have visual elements added",
    safeState = On,
    sellByDate = new LocalDate(2017, 1, 5),
    exposeClientSide = false
  )

  // Owner: Dotcom loyalty
  val EmailInArticleGtodaySwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article-gtoday",
    "When ON, the email sign-up form will show the Guardian today email sign-up on articles",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  // Owner: Dotcom loyalty
  val EmailInArticleOutbrainSwitch = Switch(
    SwitchGroup.Feature,
    "email-in-article-outbrain",
    "When ON, we will check whether email sign-up will be shown and, if so, the outbrain non-compliant merchandising widget will be shown",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

}
