package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed

class HeaderPage(webDriver: WebDriver) extends FrontsParentPage(webDriver) {

  @FindByTestAttribute(using = "logo")
  private var logo: WebElement = _

  def isDisplayed(): Boolean = {
    existsAndDisplayed(logo)
  }

  def clickLogo(): NetworkFrontPage = {
    logo.click()
    loadPage(classOf[NetworkFrontPage])
  }

  def editions(): Editions = {
    pageFactory.initPage(webDriver, classOf[Editions])
  }
}