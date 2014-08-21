package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.integration.test.steps.BaseSteps
import org.openqa.selenium.WebDriver

class TermsOfServiceTests extends IdentitySeleniumTestSuite {

  feature("Terms of Service feature") {
    scenarioWeb("should not be empty or trivial") { implicit driver: WebDriver =>
      val tosPage = BaseSteps().goToTermsOfServicePage()
      val minimumTosContentSize = 100
      tosPage.getContent().size should be > minimumTosContentSize
    }
  }
}
