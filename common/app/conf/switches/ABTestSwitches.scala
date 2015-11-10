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

  val ABRtrtEmailMessage = Switch(
    "A/B Tests",
    "ab-rtrt-email-message",
    "Switch to show the Right Place Right Time email message with segmentation",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 15),
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

  val ABLargeTopAd = Switch(
    "A/B Tests",
    "ab-large-top-ad",
    "Testing the difference of user behaviour based on large top ad format",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 31),
    exposeClientSide = true
  )

  val ABInjectNetworkFrontTest = Switch(
    "A/B Tests",
    "ab-inject-network-front-test",
    "Switch to inject the network front instead of most popular on all content pages",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 30),
    exposeClientSide = true
  )

}
