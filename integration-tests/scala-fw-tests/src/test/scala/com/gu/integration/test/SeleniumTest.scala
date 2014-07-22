package com.gu.integration.test

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers
import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.automation.core.WebDriverFactory
import com.gu.integration.test.config.WebdriverInitialiser.augmentWebDriver

abstract class SeleniumTestSuite extends WebDriverFeatureSpec with Matchers {

  override protected def startDriver(testName: String, extraCapabilities: Map[String, String] = Map()): WebDriver = {
    augmentWebDriver(super.startDriver(testName, extraCapabilities))
  }
}