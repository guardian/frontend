package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

  val RelatedVariants = Switch(
    "A/B Tests",
    "ab-related-variants",
    "show related content based on the new variants",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 15),
    exposeClientSide = true
  )

  val ABFrontsOnArticles2 = Switch(
    "A/B Tests",
    "ab-fronts-on-articles2",
    "Injects fronts on articles for the test",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 1),
    exposeClientSide = true
  )

  val ABIdentityRegisterV2 = Switch(
    "A/B Tests",
    "ab-identity-register-v2",
    "New user registration page variant for Identity",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 1),
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

  val ABLiveblogToast = Switch(
    "A/B Tests",
    "ab-liveblog-toast",
    "Enables Liveblog toast (0% test)",
    safeState = Off,
    sellByDate = new LocalDate(2016, 3, 1),
    exposeClientSide = true
  )

  val UserzoomSurveyMessageV3 = Switch(
    "A/B Tests",
    "ab-userzoom-survey-message-v3",
    "Segment the userzoom data-team survey",
    safeState = Off,
    sellByDate = new LocalDate(2016, 2, 11),
    exposeClientSide = true
  )
}
