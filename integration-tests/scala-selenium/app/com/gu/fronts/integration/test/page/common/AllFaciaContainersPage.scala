package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.util.AbstractParentPage
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed

class AllFaciaContainersPage(webDriver: WebDriver) extends FrontsParentPage(webDriver) {

  @FindByTestAttribute(using = "all-front-containers")
  private var allFaciaContainers: WebElement = _

  override def isDisplayed(): Boolean = {
    existsAndDisplayed(allFaciaContainers)
  }

  def containerWithId(testAttributeId: String): FaciaContainer = {
    pageFactory.initPage(webDriver, classOf[FaciaContainer], allFaciaContainers, testAttributeId)
  }
}