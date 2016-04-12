package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABDummyTest = Switch(
    "A/B Tests",
    "ab-dummy-test",
    "A do-nothing AA test, for the data team",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 12),
    exposeClientSide = true
  )

  // Owner: Dotcom Reach
  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 7, 5),
    exposeClientSide = true
  )

  val ABNextInSeries = Switch(
    "A/B Tests",
    "ab-next-in-series",
    "Show next in series",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 3),
    exposeClientSide = true
  )

  val ABIdentityRegisterMembershipStandfirst = Switch(
    "A/B Tests",
    "ab-identity-register-membership-standfirst",
    "Membership registration page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 4),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsInternal = Switch(
    "A/B Tests",
    "ab-live-blog-chrome-notifications-internal",
    "Live blog chrome notifications - Internal",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = true
  )

  val ABLiveBlogChromeNotificationsProd = Switch(
    "A/B Tests",
    "ab-live-blog-chrome-notifications-prod",
    "Live blog chrome notifications - prod",
    safeState = Off,
    sellByDate = new LocalDate(2016, 6, 1),
    exposeClientSide = true
  )

  val ABPeopleWhoReadThisAlsoReadVariants = Switch(
    "A/B Tests",
    "ab-people-who-read-this-also-read-variants",
    "Display people who read this also read with different variants",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 14),
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

  val ABMembership = Switch(
    "A/B Tests",
    "ab-membership",
    "Membership propositions",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 2),
    exposeClientSide = true
  )

  val ABLoyalAdblockingSurvey = Switch(
    "A/B Tests",
    "ab-loyal-adblocking-survey",
    "An adblock ongoing survey for all loyal users",
    safeState = Off,
    sellByDate = new LocalDate(2016, 5, 31),
    exposeClientSide = true
  )

}
