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
    sellByDate = new LocalDate(2016, 4, 5),
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
    sellByDate = new LocalDate(2016, 5, 2),
    exposeClientSide = true
  )

  val ABBolivianWrestlingAutoplay = Switch(
    "A/B Tests",
    "ab-bolivian-wrestling-autoplay",
    "Autoplay Bolivian Wrestling",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 12),
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
