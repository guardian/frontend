package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  // A/B Tests

  val ABLiveblogNotifications = Switch(
    "A/B Tests",
    "ab-liveblog-notifications",
    "Liveblog notifications",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 1),
    exposeClientSide = true
  )

  val ABMembershipMessageUk = Switch(
    "A/B Tests",
    "ab-membership-message-uk",
    "Switch for the UK Membership message A/B variants test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 21),
    exposeClientSide = true
  )

  val ABMembershipMessageUsa = Switch(
    "A/B Tests",
    "ab-membership-message-usa",
    "Switch for the USA Supporter message test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 9, 21),
    exposeClientSide = true
  )
}
