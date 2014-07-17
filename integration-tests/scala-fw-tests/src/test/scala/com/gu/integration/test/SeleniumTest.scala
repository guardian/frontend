package com.gu.integration.test

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.integration.test.config.WebdriverFactory

abstract class SeleniumTestSuite extends WebDriverFeatureSpec with Matchers {

  override protected def startDriver(testName: String): WebDriver = {
    WebdriverFactory.createWebDriver(testClassAndMethod(testName))
  }

  private def testClassAndMethod(testName: String): String = {
    getClass().getSimpleName() + "." + testName
  }
}