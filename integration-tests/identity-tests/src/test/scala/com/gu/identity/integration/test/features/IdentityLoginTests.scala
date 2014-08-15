package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.SignInSteps
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver

class IdentityLoginTests extends IdentitySeleniumTestSuite {

  feature("Login feature") {
    scenarioWeb("should be able to login using credentials") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage(useBetaRedirect = false)
      val signInPage = SignInSteps().openSignInPage()
      SignInSteps().signIn(signInPage)
      SignInSteps().checkUserIsLoggedIn(get("loginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
    }

    scenarioWeb("should be able to login using existing Facebook account") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage(useBetaRedirect = false)
      val signInPage = SignInSteps().openSignInPage()
      SignInSteps().signInUsingFaceBook(signInPage)
      SignInSteps().checkUserIsLoggedIn(get("faceBookLoginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
      SignInSteps().checkLoggedInThroughSocialMedia()
    }

    scenarioWeb("should be able to login using existing Google account") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage(useBetaRedirect = false)
      val signInPage = SignInSteps().openSignInPage()
      SignInSteps().signInUsingGoogle(signInPage)
      SignInSteps().checkUserIsLoggedIn(get("googleLoginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
      SignInSteps().checkLoggedInThroughSocialMedia()
    }
  }
}
