package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.page.common.FaciaContainer
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

class MostPopularModule(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def mostPopularRootElement: WebElement = findByTestAttribute("right-most-popular")

  def assertIsDisplayed() = {
    assertExistsAndDisplayed(mostPopularRootElement)
  }
}