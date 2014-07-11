package com.gu.integration.test.pages.article

import org.openqa.selenium.{ WebDriver, WebElement }
import com.gu.integration.test.config.PropertyLoader._
import com.gu.integration.test.pages.common.MostPopularModule
import com.gu.integration.test.pages.common.ParentPage

class ArticlePage(implicit driver: WebDriver) extends ParentPage {

  val articleRootElement: WebElement = findByTestAttribute("article-root")
  
  def mostPopularModule() = {
    new MostPopularModule
  }
}