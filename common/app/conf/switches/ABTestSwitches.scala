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

  val ABHostedAutoplay = Switch(
    SwitchGroup.ABTests,
    "ab-hosted-autoplay",
    "An autoplay overlay with the next video on a hosted page",
    owners = Seq(Owner.withGithub("Calanthe")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 8, 12),
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

  val ABGiraffeArticle20160802 = Switch(
    SwitchGroup.ABTests,
    "ab-giraffe-article-20160802",
    "Test effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler"), Owner.withGithub("AWare")),
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
    sellByDate = new LocalDate(2016, 8, 12),
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
}
