package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

class ArticlePage(implicit driver: WebDriver) extends FrontsParentPage() {

  val articleRootElement: WebElement = findByTestAttribute("article-root")
  
  def mostPopularModule() = {
    new MostPopularModule()
  }
}