package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.SignInSteps
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver

class IdentityLoginTests extends IdentitySeleniumTestSuite {

  feature("Login feature") {
    scenarioWeb("should be able to login using credentials") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      val signInPage = SignInSteps().openSignInPage()
      SignInSteps().signIn(signInPage)
      SignInSteps().checkUserIsLoggedIn(get("loginName"))
    }

    scenarioWeb("should be able to login using existing facebook account") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      val signInPage = SignInSteps().openSignInPage()
      SignInSteps().signInUsingFaceBook(signInPage)
      SignInSteps().checkUserIsLoggedIn(get("faceBookLoginName"))
      SignInSteps().checkLoggedInThroughFaceBook()
    }
  }
}
