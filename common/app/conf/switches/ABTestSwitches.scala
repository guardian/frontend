package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val RelatedVariants = Switch(
    "A/B Tests",
    "ab-related-variants",
    "show related content based on the new variants",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 25),
    exposeClientSide = true
  )

  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 1),
    exposeClientSide = true
  )

  val ABIdentitySignInV2 = Switch(
    "A/B Tests",
    "ab-identity-sign-in-v2",
    "New sign in page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 1),
    exposeClientSide = true
  )

  val ABRtrtEmailFormArticlePromoV2 = Switch(
    "A/B Tests",
    "ab-rtrt-email-form-article-promo-v2",
    "Testing the email sign up from the bottom of articles of user referred from fronts",
    safeState = Off,
    sellByDate = new LocalDate(2016, 1, 21),
    exposeClientSide = true
  )

  val ABRemoveStickyNav = Switch(
    "A/B Tests",
    "ab-remove-sticky-nav",
    "Removes the sticky nav (0% test)",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 1),
    exposeClientSide = true
  )
}
