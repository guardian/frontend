package com.gu.integration.test

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers
import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.integration.test.config.WebdriverFactory

abstract class FrontsSeleniumTestSuite extends WebDriverFeatureSpec with Matchers with PageHelper {

  override protected def startDriver(testName: String): WebDriver = {
    WebdriverFactory.createWebDriver(testClassAndMethod(testName))
  }

  private def testClassAndMethod(testName: String): String = {
    getClass().getSimpleName() + "." + testName
  }
}