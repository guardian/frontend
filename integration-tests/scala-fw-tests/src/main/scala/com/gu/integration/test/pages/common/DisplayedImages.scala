package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader

/**
 * Use this trait on page objects/modules which has images nested inside it and you want to check if they are displayed. For it
 * to work you *must* define a members rootElement: WebElement, this is from where the search will be based on, and an implicit
 * val WebDriver
 */
trait DisplayedImages {
  val rootElement: WebElement
  implicit val driver: WebDriver

  def displayedImages: List[WebElement] = {
    ElementLoader.displayedImages(rootElement)
  }
}