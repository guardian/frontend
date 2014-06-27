package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.util.AbstractParentPage

class AllFaciaContainersPage(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "all-front-containers")
  private var allFaciaContainers: WebElement = _

  override def isDisplayed(): AllFaciaContainersPage = {
    assertExistsAndDisplayed(allFaciaContainers)
    this
  }

  def containerWithId(testAttributeId: String): FaciaContainer = {
    pageFactory.initPage(webDriver, classOf[FaciaContainer], allFaciaContainers, testAttributeId)
  }
}