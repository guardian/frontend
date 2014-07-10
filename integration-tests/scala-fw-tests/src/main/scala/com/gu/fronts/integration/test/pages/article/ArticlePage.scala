package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.page.common.FaciaContainer
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

class ArticlePage(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def articleRootElement: WebElement = findByTestAttribute("article-root")

  def assertIsDisplayed() = {
    assertExistsAndDisplayed(articleRootElement)
  }
  
  def mostPopularModule() = {
    new MostPopularModule()
  }
}