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

  val ABRtrtEmailFormInlineFooter = Switch(
    "A/B Tests",
    "ab-rtrt-email-form-inline-footer",
    "Switch to show the email form inline in the footer",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 15),
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

  val ABInjectNetworkFrontTest2 = Switch(
    "A/B Tests",
    "ab-inject-network-front-test2",
    "Switch to inject the network front instead of most popular on all content pages",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 5),
    exposeClientSide = true
  )

  val ABReachDummyTest = Switch(
    "A/B Tests",
    "ab-reach-dummy-test",
    "Switch to inject the network front instead of most popular on all content pages",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 5),
    exposeClientSide = true
  )

  val ABMostPopularDefaultTest2 = Switch(
    "A/B Tests",
    "ab-most-popular-default-test-2",
    "Switch to change the default of most popular container to show across the guardian first instead of section",
    safeState = Off,
    sellByDate = new LocalDate(2015, 11, 27),
    exposeClientSide = true
  )

  val ABEssentialReadTest1 = Switch(
    "A/B Tests",
    "ab-essential-read-test-1",
    "Show the essential read instead of related content",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 15),
    exposeClientSide = true
  )

  val ABVideoPreroll = Switch(
    "A/B Tests",
    "ab-video-preroll",
    "A test to see if a UK or INT audience will be interested in video pre-rolls",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 11),
    exposeClientSide = true
  )
}
