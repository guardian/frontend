package com.gu.integration.test.util

import scala.collection.JavaConverters.asScalaBufferConverter

import org.openqa.selenium.WebElement
import org.openqa.selenium.By

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
  }
}