package com.gu.fronts.integration.test

import org.openqa.selenium.WebDriver

trait PageHelper {

  var driver: WebDriver;

  def goTo[Page](url: String, pageClass: Class[Page]): Page = {
    driver.get(url)
    instantiatePage(driver, pageClass)
  }

  /**
   * This will append the request parameters needed to switch to beta site. However, for some reason, this does not work on
   * localhost so had to make a check
   */
  def buildBetaSiteUrl(frontsBaseUrl: String): String = {
    if (frontsBaseUrl.startsWith("http://localhost")) {
      frontsBaseUrl
    } else {
      frontsBaseUrl + "/preference/platform/mobile?page=" + frontsBaseUrl + "&view=mobile"
    }
  }

  private def instantiatePage[Page](driver: WebDriver, pageClass: Class[Page]): Page = {
    val constructor = pageClass.getConstructor(classOf[WebDriver])
    constructor.newInstance(driver)
  }
}