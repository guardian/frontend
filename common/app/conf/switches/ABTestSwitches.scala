package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

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
    sellByDate = new LocalDate(2015, 10, 27),
    exposeClientSide = true
  )

}
