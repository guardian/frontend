package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  // A/B Tests

  val ABMembershipMessageUk = Switch(
    "A/B Tests",
    "ab-membership-message-uk",
    "Switch for the UK Membership message A/B variants test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 18),
    exposeClientSide = true
  )

  val ABMembershipMessageUsa = Switch(
    "A/B Tests",
    "ab-membership-message-usa",
    "Switch for the USA Supporter message test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 18),
    exposeClientSide = true
  )

  val ABDisableAdsSurvey = Switch(
    "A/B Tests",
    "ab-disable-ads-survey",
    "Switch to show the survey which tests if users will be interested in paying for the Guardian with no ads",
    safeState = Off,
    sellByDate = new LocalDate(2015, 10, 15),
    exposeClientSide = true
  )

  val ABMostPopRelContPosition = Switch(
    "A/B Tests",
    "ab-most-pop-rel-cont-position",
    "Switch to show swap the locations of most popular and related content",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = true
  )

}
