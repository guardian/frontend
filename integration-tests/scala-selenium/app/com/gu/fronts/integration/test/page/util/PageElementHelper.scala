package com.gu.fronts.integration.test.page.util

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.TEST_ATTR_NAME
import org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable
import org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.ui.WebDriverWait
//remove if not needed
import scala.collection.JavaConversions._

object PageElementHelper {

  private val CLICKABLE_WAIT = 2

  def elementClickable(element: WebElement, webDriver: WebDriver): Boolean = {
    val wait = new WebDriverWait(webDriver, CLICKABLE_WAIT)
    (wait until elementToBeClickable(element)) != null
  }

  def elementIsALink(element: WebElement): Boolean = {
    "a".equalsIgnoreCase(element.getTagName)
  }

  def findElementBy(baseWebElement: WebElement, by: By): WebElement = baseWebElement.findElement(by)

  def getLinkFrom(rootElement: WebElement): WebElement = {
    rootElement.findElement(By.cssSelector("a"))
  }

  def waitUntilVisible(element: WebElement, timeout: Int, webDriver: WebDriver): WebElement = {
    (new WebDriverWait(webDriver, timeout)) until visibilityOf(element)
  }
}