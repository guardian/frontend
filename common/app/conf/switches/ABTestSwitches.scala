package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABLiveBlogChromeNotificationsProd2 = Switch(
    SwitchGroup.ABTests,
    "ab-live-blog-chrome-notifications-prod2",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 30),
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

  val ABContributionsArticle20160822 = Switch(
    SwitchGroup.ABTests,
    "ab-contributions-article-20160822",
    "Test effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 6),
    exposeClientSide = true
  )

  val ABContributionsUserTesting20160831 = Switch(
    SwitchGroup.ABTests,
    "ab-contributions-user-testing-20160831",
    "User testing effectiveness of inline CTA for contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 6),
    exposeClientSide = true
  )

  val ABContributionsEmbed20160823= Switch(
    SwitchGroup.ABTests,
    "ab-contributions-embed-20160823",
    "Test contributions embed with amount picker.",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 6),
    exposeClientSide = true
  )

  val ABParticipationDiscussionOrderingLiveBlogs = Switch(
    SwitchGroup.ABTests,
    "ab-participation-discussion-ordering-live-blog",
    "Test to see whether ordering comments by recommends on live blogs increases the number oof people who read them",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 15), //Wednesday
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

  val ABAdFeedback = Switch(
    SwitchGroup.ABTests,
    "ab-ad-feedback",
    "Solicit feedback for ad impressions",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 14),  // Wednesday
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

  val ABDontUpgradeMobileRichLinks = Switch(
    SwitchGroup.ABTests,
    "ab-dont-upgrade-mobile-rich-links",
    "Test whether the loyalty of users decreases with non-enhanced rich links",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 14),
    exposeClientSide = true
  )

  val ABAdBlockingResponse = Switch(
    SwitchGroup.ABTests,
    "ab-ad-blocking-response",
    "Prominent adblocker response test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 18),   // Tuesday
    exposeClientSide = true
  )

  val ABNoSocialCount = Switch(
    SwitchGroup.ABTests,
    "ab-no-social-count",
    "Remove social count from articles",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 21),   // Wednesday
    exposeClientSide = true
  )
}
