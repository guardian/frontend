package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object AllFaciaContainersPage {
  val IN_PICTURES_CONTAINER_ID = "in-pictures"
}
class AllFaciaContainersPage(implicit var driver: WebDriver) extends FrontsParentPage() {

  private var allFaciaContainers: WebElement = findByTestAttribute("all-front-containers")

  override def isDisplayed() = {
    existsAndDisplayed(allFaciaContainers)
  }

  def containerWithId(testAttributeId: String): FaciaContainer = {
    val faciaContainer = new FaciaContainer(findByTestAttribute(testAttributeId, allFaciaContainers))
    faciaContainer.isDisplayed
    faciaContainer
  }
}