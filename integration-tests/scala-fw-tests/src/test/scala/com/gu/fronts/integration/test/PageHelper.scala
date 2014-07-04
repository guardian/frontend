package com.gu.fronts.integration.test

import org.openqa.selenium.WebDriver
import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

trait PageHelper {

  var driver: WebDriver;
  val frontsBaseUrl = getProperty(BASE_URL)
  
  def goTo(pageClass: FrontsParentPage): FrontsParentPage = {
    goTo(pageClass.url, pageClass)
  }

  def goTo(url: String, pageClass: FrontsParentPage): FrontsParentPage = {
    driver.get(forceBetaSite(url))
    pageClass.isDisplayed
    pageClass
  }

  /**
   * This will append the request parameters needed to switch to beta site. However, for some reason, this does not work on
   * localhost so had to make a check
   */
  def forceBetaSite(url: String): String = {
    if (frontsBaseUrl.startsWith("http://localhost")) {
      url
    } else {
      frontsBaseUrl + "/preference/platform/mobile?page=" + url + "&view=mobile"
    }
  }

  private def instantiatePage[Page](driver: WebDriver, pageClass: Class[Page]): Page = {
    val constructor = pageClass.getConstructor(classOf[WebDriver])
    constructor.newInstance(driver)
  }
}