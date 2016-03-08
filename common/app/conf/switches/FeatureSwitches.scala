package conf.switches

import conf.switches.Expiry.never
import org.joda.time.LocalDate

trait FeatureSwitches {

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

  val OutbrainSwitch = Switch(
    "Feature",
    "outbrain",
    "Enable the Outbrain content recommendation widget.",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val PlistaForOutbrainAU = Switch(
    "Feature",
    "plista-for-outbrain-au",
    "Enable the Plista content recommendation widget to replace that of Outbrain for AU edition. For CODE environment only.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 6),
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
    sellByDate = new LocalDate(2016, 4, 11),
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

  val EmailInlineInFooterSwitch = Switch(
    "Feature",
    "email-inline-in-footer",
    "show the email sign-up in the footer",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = true
  )

  val UseAtomsSwitch = Switch(
    "Feature",
    "use-atoms",
    "use atoms from content api to enhance content",
    safeState = Off,
    sellByDate = never,
    exposeClientSide = false
  )

  val AmpSwitch = Switch(
    "Server-side A/B Tests",
    "amp-switch",
    "If this switch is on, link to amp pages will be in the metadata for articles",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val R2PagePressServiceSwitch = Switch(
    "Feature",
    "r2-page-press-service",
    "When ON, the R2 page press service will monitor the queue and press pages to S3",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )

  val R2HeadersRequiredForPagePressingSwitch = Switch(
    "Feature",
    "r2-headers-page-press-service",
    "When ON, the R2 page press service will hit the R2 page, when turned off it will hit Dotcom",
    safeState = On,
    sellByDate = never,
    exposeClientSide = false
  )


  val EmailInArticleSwitch = Switch(
    "Feature",
    "email-in-article",
    "When ON, the email sign-up form will show on articles matching the email lists utilising the email module",
    safeState = On,
    sellByDate = never,
    exposeClientSide = true
  )

  val USElectionSwitch = Switch(
    "Feature",
    "us-election",
    "When ON, items tagged with us-news/us-elections-2016 will have visual elements added",
    safeState = On,
    sellByDate = new LocalDate(2017, 1, 5),
    exposeClientSide = false
  )

  val BreakingNewsFromAdminJobsSwitch = Switch(
    "Feature",
    "breaking-news-from-admin-jobs",
    "When ON, the breaking news data is fetched from the json file generated by the Admin-jobs app, and not from the file generated by Facia-Press",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 5), //Tuesday
    exposeClientSide = true
  )

  // Owner: Dotcom reach
  val ForceSchemaOrgTypeForAmpArticlesSwitch = Switch(
    "Feature",
    "force-schema-org-type-for-amp-articles",
    "When ON, all amplified articles have schema.org type set to 'NewsArticle' (which is the only type Google search carousel supports as of Feb 2015)",
    safeState = On,
    sellByDate = new LocalDate(2016, 4, 5), //Tuesday
    exposeClientSide = false
  )

  // Owner: Dotcom health (R2/R1 decommissioning)
  val ArchiveResolvesR1UrlsInRedirectTableSwitch = Switch(
    "Feature",
    "archive-service-resolves-r1-urls",
    "When ON, the archive service can resolve un-normalisd R1 paths from the redirects table.",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 30), //Wednesday
    exposeClientSide = false
  )
}
