package com.gu.fronts.integration.test.page.nwfront

import java.util.Date
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.util.AbstractParentPage
import com.gu.fronts.integration.test.page.util.NetworkFrontDate

class NetworkFrontDateBox(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "network-front-date-title")
  private var dateTitle: WebElement = _

  @FindByTestAttribute(using = "network-front-day-month")
  private var dayOfMonth: WebElement = _

  override def isDisplayed(): NetworkFrontDateBox = {
    assertExistsAndDisplayed(dateTitle)
    this
  }

  def getDate(): Date = {
    new NetworkFrontDate(dateTitle.getText).parseToDate()
  }

  def getDayOfWeek(): String = {
    new NetworkFrontDate(dateTitle.getText).getDayOfWeek
  }
}