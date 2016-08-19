package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABLiveBlogChromeNotificationsProd2 = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod2",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
    exposeClientSide = true
  )

  val ABDiscussionExternalFrontend = Switch(
    SwitchGroup.ABTests,
    "ab-discussion-external-frontend",
    "Standalone frontend discussion",
    owners = Seq(Owner.withGithub("piuccio")),
    safeState = On,
    sellByDate = new LocalDate(2016, 9, 30),
    exposeClientSide = true
  )

  val ABHostedAutoplay = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-autoplay",
    "An autoplay overlay with the next video on a hosted page",
    owners = Seq(Owner.withGithub("Calanthe")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 19),
    exposeClientSide = true
  )

  val ABHostedZootropolisCta = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-zootropolis-cta",
    "Additional text on the Zootropolis CTA banner",
    owners = Seq(Owner.withGithub("Calanthe")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 24),
    exposeClientSide = true
  )

  val ABHostedArticleOnwardJourney = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-article-onward-journey",
    "Vertical positioning of the onward journey links",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16),
    exposeClientSide = true
  )

  val ABHostedGalleryCallToAction = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-gallery-cta",
    "Test which gallery image to put the call to action link on",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16),
    exposeClientSide = true
  )

  val ABContributionsArticle20160818 = Switch(
    SwitchGroup.ABTests,
    "ab-contributions-article-20160818",
    "Test effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 22),
    exposeClientSide = true
  )

  val ABParticipationDiscussionOrderingLiveBlogs = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-ordering-live-blog",
    "Test to see whether ordering comments by recommends on live blogs increases the number oof people who read them",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
    exposeClientSide = true
  )

  val ABParticipationDiscussionOrderingNonLive = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-ordering-non-live",
    "Test to see whether ordering comments by recommends on content o[ther than live blogs increases the number oof people who read them",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 31),
    exposeClientSide = true
  )

  val ABRemindMeEmail = Switch(
    SwitchGroup.ABTests,
    "ab-remind-me-email",
    "Sign up for an email to remind you about the next item in a series",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = On,
    sellByDate = new LocalDate(2016, 8, 19),
    exposeClientSide = true
  )

  val ABMembershipEngagementBanner = Switch(
    SwitchGroup.ABTests,
    "ab-membership-engagement-banner",
    "Test effectiveness of header for driving membership.",
    owners = Seq(Owner.withGithub("rtyley")),
    safeState = On,
    sellByDate = new LocalDate(2017, 9, 7),
    exposeClientSide = true
  )

  val ABContributionsHeader20160802 = Switch(
    SwitchGroup.ABTests,
    "ab-contributions-header-20160802",
    "Test effectiveness of header for driving contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 22),
    exposeClientSide = true
  )

  val ABAdFeedback = Switch(
    SwitchGroup.ABTests,
    "ab-ad-feedback",
    "Solicit feedback for ad impressions",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 14),  // Wednesday
    exposeClientSide = true
  )

  val ABMinute = Switch(
    SwitchGroup.ABTests,
    "ab-minute",
    "Testing if minute teasers drive video plays.",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 1),
    exposeClientSide = true
  )

  val ABMinuteLoadJs = Switch(
    SwitchGroup.ABTests,
    "ab-minute-load-js",
    "Load JS for minute test participants on some content pages.",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 1),
    exposeClientSide = true
  )

  val ABRecommendedForYou = Switch(
    SwitchGroup.ABTests,
    "ab-recommended-for-you",
    "Test demand for a personalised container on fronts",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 9),
    exposeClientSide = true
  )
}
