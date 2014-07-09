package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.page.common.FaciaContainer
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object NetworkFrontPage {
  val InPicturesContainerId = "in-pictures"
}

class NetworkFrontPage(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def dateTitle: WebElement = findByTestAttribute("network-front-date-title")
  private def allFaciaContainers: WebElement = findByTestAttribute("all-front-containers")

  override def url = getProperty(BaseUrl)

  def isDisplayed() = {
    existsAndDisplayed(dateTitle)
  }

  def faciaContainerWithId(testAttributeId: String): FaciaContainer = {
    val faciaContainer = new FaciaContainer(findByTestAttribute(testAttributeId, allFaciaContainers))
    faciaContainer.isDisplayed
    faciaContainer
  }
}