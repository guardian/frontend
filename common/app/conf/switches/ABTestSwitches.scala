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

  val ABMostPopRelContPosition = Switch(
    "A/B Tests",
    "ab-most-pop-rel-cont-position",
    "Switch to show swap the locations of most popular and related content",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = true
  )

  val ABRtrtEmailMessage = Switch(
    "A/B Tests",
    "ab-rtrt-email-message",
    "Switch to show the Right Place Right Time email message with segmentation",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 15),
    exposeClientSide = true
  )

  val ABMostPopAsFaciaCards = Switch(
    "A/B Tests",
    "ab-most-pop-as-facia-cards",
    "Style the most popular container as facia cards",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = true
  )

  val ABOnwardNames = Switch(
    "A/B Tests",
    "ab-onward-names",
    "Switch to enable alternative name for related content",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 20),
    exposeClientSide = true
  )

  val ABInjectHeadlinesTest = Switch(
    "A/B Tests",
    "ab-inject-headlines-test",
    "Switch to inject the headlines container instead of related content in the world, uk-news and politics sections between the hours of 6am-11am on the UK edition",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = true
  )

}
