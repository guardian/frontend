package com.gu.fronts.integration.test.page.nwfront

import com.gu.fronts.integration.test.pages.common.FrontsParentPage
import org.openqa.selenium.{WebDriver, WebElement}

object NetworkFrontPage {
  val IN_PICTURES_CONTAINER_ID = "in-pictures"
}

class NetworkFrontPage(implicit webDriver: WebDriver) extends FrontsParentPage(webDriver) {

  private def dateTitle: WebElement = findByTestAttribute("network-front-date-title")

  def isDisplayed(): Boolean = {
    existsAndDisplayed(dateTitle)
  }

//  def containers(): AllFaciaContainersPage = {
//    loadPage(classOf[AllFaciaContainersPage])
//  }
}