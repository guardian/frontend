package com.gu.fronts.integration.test.page.nwfront

import java.util.Date

import org.openqa.selenium.{WebDriver, WebElement}

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.util.{FrontsParentPage, NetworkFrontDate}
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed

class NetworkFrontDateBox(webDriver: WebDriver) extends FrontsParentPage(webDriver) {

  @FindByTestAttribute(using = "network-front-date-title")
  private var dateTitle: WebElement = _

  @FindByTestAttribute(using = "network-front-day-month")
  private var dayOfMonth: WebElement = _

  override def isDisplayed(): Boolean = {
    existsAndDisplayed(dateTitle)
  }

  def getDate(): Date = {
    new NetworkFrontDate(dateTitle.getText).parseToDate()
  }

  def getDayOfWeek(): String = {
    new NetworkFrontDate(dateTitle.getText).getDayOfWeek
  }
}