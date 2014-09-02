package com.gu.integration.test.util

import scala.collection.JavaConverters.asScalaBufferConverter

import org.openqa.selenium.{JavascriptExecutor, WebDriver, WebElement, By}

object WebElementEnhancer {

  implicit class WebElementEnhanced(val webElement: WebElement) extends AnyVal {

    def findHiddenDirectElements(childElementName: String): List[WebElement] = {
      ElementLoader.notDisplayed(findDirectElements(childElementName))
    }

    def findVisibleDirectElements(childElementName: String): List[WebElement] = {
      ElementLoader.displayed(findDirectElements(childElementName))
    }

    def findDirectElements(childElementName: String): List[WebElement] = {
      webElement.findElements(By.xpath(s"./${childElementName}")).asScala.toList
    }

    /**
     * Observe that a WebDriver has to be in scope to use this methid
     */
    def scrollIntoView()(implicit driver: WebDriver) = {
      driver.asInstanceOf[JavascriptExecutor].executeScript("arguments[0].scrollIntoView(true);", webElement)
    }
  }
}