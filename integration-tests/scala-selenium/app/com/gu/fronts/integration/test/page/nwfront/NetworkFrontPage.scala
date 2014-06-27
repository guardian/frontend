package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.common.AllFaciaContainersPage
import com.gu.fronts.integration.test.page.util.AbstractParentPage
import NetworkFrontPage._

object NetworkFrontPage {

  val IN_PICTURES_CONTAINER_ID = "in-pictures"

  val TOP_STORIES_CONTAINER_ID = "top-stories"

  val SPORT_CONTAINER_ID = "sport"
}

class NetworkFrontPage(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "network-front-date-title")
  private var dateTitle: WebElement = _

  def isDisplayed(): NetworkFrontPage = {
    assertExistsAndDisplayed(dateTitle)
    this
  }

  def dateBox(): NetworkFrontDateBox = loadPage(classOf[NetworkFrontDateBox])

  def containers(): AllFaciaContainersPage = {
    loadPage(classOf[AllFaciaContainersPage])
  }
}