package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val AlternativeRelated = Switch(
    "A/B Tests",
    "ab-alternative-related",
    "show alternative related content based on the tags to users in the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 23),
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

  val ABFrontsOnArticles = Switch(
    "A/B Tests",
    "ab-fronts-on-articles",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2015, 12, 30),
    exposeClientSide = true
  )

  val ABVideoPreroll = Switch(
    "A/B Tests",
    "ab-video-preroll",
    "A test to see if a UK or INT audience will be interested in video pre-rolls",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 6),
    exposeClientSide = true
  )

  val ABIdentitySignInV2 = Switch(
    "A/B Tests",
    "ab-identity-sign-in-v2",
    "New sign in page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 15),
    exposeClientSide = true
  )
}
