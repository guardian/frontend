package com.gu.integration.test

import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.automation.support.Browser
import com.gu.integration.test.config.WebdriverInitialiser.augmentWebDriver
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

abstract class SeleniumTestSuite extends WebDriverFeatureSpec with Matchers {

  override protected def startDriver(testName: String, targetBrowser: Browser): WebDriver = {
    println("local conf location " + System.getProperty("local.conf.loc"))
    augmentWebDriver(super.startDriver(testName, targetBrowser))
  }
}