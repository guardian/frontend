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
    sellByDate = new LocalDate(2016, 1, 13),
    exposeClientSide = true
  )

  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 30),
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

  val ABRtrtEmailFormArticlePromo = Switch(
    "A/B Tests",
    "ab-rtrt-email-form-article-promo",
    "Testing the email sign up from the bottom of articles of user referred from fronts",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 17),
    exposeClientSide = true
  )

  val ABRemoveStickyNav = Switch(
    "A/B Tests",
    "ab-remove-sticky-nav",
    "Removes the sticky nav (0% test)",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 28),
    exposeClientSide = true
  )
}
