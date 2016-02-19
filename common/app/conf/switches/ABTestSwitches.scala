package conf.switches

import org.joda.time.LocalDate

trait ABTestSwitches {

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

  val ABCommercialComponentsDismiss = Switch(
    "A/B Tests",
    "ab-commercial-components-dismiss",
    "Survey possibility of dismiss option for commercial components",
    safeState = Off,
    sellByDate = new LocalDate(2016, 4, 5),
    exposeClientSide = true
  )

}
