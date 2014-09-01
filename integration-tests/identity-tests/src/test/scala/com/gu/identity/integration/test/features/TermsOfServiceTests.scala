package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.integration.test.steps.BaseSteps
import org.openqa.selenium.WebDriver

class TermsOfServiceTests extends IdentitySeleniumTestSuite {

  feature("Terms of Service feature") {
    scenarioWeb("should not be empty or trivial") { implicit driver: WebDriver =>
      val tosPage = BaseSteps().goToTermsOfServicePage()
      val minimumTosContentSize = 100
      val tosContent: String = tosPage.getContent()

      tosContent.size should be > minimumTosContentSize

      tosContent.contains("Terms and conditions") should be (true)
      tosContent.contains("Guardian") should be (true)
      tosContent.contains("theguardian.com") should be (true)
      tosContent.contains("disclaimer") should be (true)
    }
  }
}
