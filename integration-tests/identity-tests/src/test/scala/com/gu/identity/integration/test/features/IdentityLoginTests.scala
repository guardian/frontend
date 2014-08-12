package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.SignInSteps
import com.gu.integration.test.steps.BaseSteps
import org.openqa.selenium.WebDriver

class IdentityLoginTests extends IdentitySeleniumTestSuite {

  feature("Login feature") {
    scenarioWeb("should be able to login using credentials") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      SignInSteps().signIn()
      SignInSteps().checkUserIsLoggedIn()
    }
  }
}
