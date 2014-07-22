package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader.findByTestAttribute

class RelatedContentModule(implicit val driver: WebDriver) extends ParentPage with DisplayedImages {
  val rootElement: WebElement = findByTestAttribute("related-content")

  def displayedLinks(): List[WebElement] = {
    ElementLoader.displayedLinks(rootElement)
  }
}