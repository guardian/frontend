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

  val ABLiveEventsSurvey = Switch(
    "A/B Tests",
    "ab-live-events-survey",
    "Survey to test if users will be interested in paying for the Guardian with free live streaming events",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 3),
    exposeClientSide = true
  )

}
