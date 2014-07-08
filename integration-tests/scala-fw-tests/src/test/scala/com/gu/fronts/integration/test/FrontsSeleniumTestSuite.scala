package com.gu.fronts.integration.test

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.fronts.integration.test.config.WebdriverFactory

abstract class FrontsSeleniumTestSuite extends WebDriverFeatureSpec with Matchers with PageHelper {

  override protected def startDriver(): WebDriver = {
    WebdriverFactory.createWebDriver(testClassAndMethod)
  }

  private def testClassAndMethod(): String = {
    getClass().getSimpleName() + "." + testName
  }
}