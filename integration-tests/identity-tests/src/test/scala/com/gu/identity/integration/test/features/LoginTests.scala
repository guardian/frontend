package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.SignInSteps
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver

class LoginTests extends IdentitySeleniumTestSuite {

  feature("Login feature") {
    scenarioWeb("should be able to login using credentials") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      SignInSteps().signIn()
      SignInSteps().checkUserIsLoggedIn(get("loginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
    }

    scenarioWeb("should be able to login using existing Facebook account") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      SignInSteps().signInUsingFaceBook()
      SignInSteps().checkUserIsLoggedIn(get("faceBookLoginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
      SignInSteps().checkLoggedInThroughSocialMedia()
    }

    scenarioWeb("should be able to login using existing Google account") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      SignInSteps().signInUsingGoogle()
      SignInSteps().checkUserIsLoggedIn(get("googleLoginName"))
      SignInSteps().checkUserIsLoggedInSecurely()
      SignInSteps().checkLoggedInThroughSocialMedia()
    }
  }
}
