package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FeatureSwitches {

  val contentAgeMessageSwitch = Switch(
    "Feature",
    "content-age-message",
    "Show old content message on... old content (tagged tone/news)",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 6),
    exposeClientSide = false
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
    sellByDate = new LocalDate(2016, 11, 7),
    exposeClientSide = false
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
    sellByDate = new LocalDate(2016, 1, 10),
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

  val SplitOlderIPadsSwitch = Switch(
    "Feature",
    "ipad-split-capabilities",
    "If switched on then this gives older ipads the stripped down front but full articles",
    safeState = On,
    sellByDate = new LocalDate(2016, 2, 1),
    exposeClientSide = false
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

  val RugbyScoresSwitch = Switch(
    "Feature",
    "rugby-world-cup",
    "If this switch is on rugby world cup scores will be loaded in to rugby match reports and liveblogs",
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

  val DiscussionHttpsSwitch = Switch(
    "Feature",
    "discussion-https",
    "in discussion we will send requests to https",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val EmailInlineInFooterSwitch = Switch(
    "Feature",
    "email-inline-in-footer",
    "show the email sign-up in the footer",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val r2PressToS3Switch = Switch(
    "Feature",
    "r2-press-page-to-s3",
    "when switched on this will press the original and cleaned up R2 page to S3",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 1),
    exposeClientSide = false
  )

}
