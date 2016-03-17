package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 1),
    exposeClientSide = true
  )

  val ABNextInSeries = Switch(
    "A/B Tests",
    "ab-next-in-series",
    "Show next in series",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 23),
    exposeClientSide = true
  )

  val ABIdentityRegisterMembershipStandfirst = Switch(
    "A/B Tests",
    "ab-identity-register-membership-standfirst",
    "Membership registration page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 1),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotifications = Switch(
    "A/B Tests",
    "ab-live-blog-chrome-notifications",
    "Live blog chrome notifications",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 1),
    exposeClientSide = true
  )

  val ABArticleVideoAutoplay = Switch(
    "A/B Tests",
    "ab-article-video-autoplay",
    "Autoplay embedded videos in article",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 23),
    exposeClientSide = true
  )

  val ABCommercialComponentsDismiss = Switch(
    "A/B Tests",
    "ab-commercial-components-dismiss",
    "Survey possibility of dismiss option for commercial components",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 5),
    exposeClientSide = true
  )

  val ABRelatedContentDisplayAsRecommendation = Switch(
    "A/B Tests",
    "ab-article-related-content-display-as-recommendation",
    "Display related content as people who read this also read",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 18),
    exposeClientSide = true
  )

  val ABHeaderBiddingUS = Switch(
    "A/B Tests",
    "ab-header-bidding-us",
    "Auction adverts on the client before calling DFP (US edition only)",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 20),
    exposeClientSide = true
  )

  val ABEmailSignupMarketingCheckbox = Switch(
    "A/B Tests",
    "ab-email-signup-marketing-checkbox",
    "Test marketing checkbox in email sign-up",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 23),
    exposeClientSide = true
  )

  val ABAdblockingResponse = Switch(
    "A/B Tests",
    "ab-adblocking-response",
    "Adblocking respoonse test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 31),
    exposeClientSide = true
  )

}
