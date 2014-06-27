package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.AbstractParentPage

class FooterPage(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "copyright")
  private var copyright: WebElement = _

  @FindByTestAttribute(using = "logo_footer")
  private var logo: WebElement = _

  def isDisplayed(): FooterPage = {
    super.assertExistsAndDisplayed(copyright, logo)
    this
  }

  def clickLogo(): NetworkFrontPage = {
    logo.click()
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }
}