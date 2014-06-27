package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.AbstractParentPage

class HeaderPage(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "logo")
  private var logo: WebElement = _

  def isDisplayed(): HeaderPage = {
    super.assertExistsAndDisplayed(logo)
    this
  }

  def clickLogo(): NetworkFrontPage = {
    logo.click()
    loadPage(classOf[NetworkFrontPage])
  }

  def editions(): Editions = {
    pageFactory.initPage(webDriver, classOf[Editions])
  }
}