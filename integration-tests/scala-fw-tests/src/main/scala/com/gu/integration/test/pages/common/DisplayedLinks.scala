package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.integration.test.util.ElementLoader
import org.openqa.selenium.By
import org.openqa.selenium.support.ui.ExpectedConditions

/**
 * Use this trait on page objects/modules which has links nested inside it and you want to check if they are displayed. For it
 * to work you *must* define a members rootElement: WebElement, this is from where the search will be based on, and an implicit
 * val WebDriver
 */
trait DisplayedLinks {
  val rootElement: WebElement
  implicit val driver: WebDriver

  def displayedLinks(maxElements: Int = Int.MaxValue): List[WebElement] = {
    ElementLoader.displayedLinks(rootElement, maxElements)
  }

  /**
   * Find one visible link, including nested, from the provided SearchContext or, if none is provided, the driver
   */
  def displayedLink(implicit driver: WebDriver): WebElement = {
    ElementLoader.displayedLink(rootElement)
  }
}