package com.gu.integration.test.util

import scala.collection.JavaConverters._
import org.openqa.selenium.WebElement
import org.openqa.selenium.SearchContext
import org.openqa.selenium.WebDriver
import org.openqa.selenium.By
import com.gu.integration.test.config.PropertyLoader._

object ElementLoader {

  val frontsBaseUrl = getProperty(BaseUrl)
  val TestAttributeName = "data-test-id"

  /**
   * Will find the element with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver
   */
  def findByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver: WebDriver): WebElement = {
    wrapException {
      contextElement.getOrElse(driver).findElement(byTestAttributeId(testAttributeValue))
    }
  }

  /**
   * Will find all elements with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver
   */
  def findAllByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver: WebDriver): List[WebElement] = {
    wrapException {
      contextElement.getOrElse(driver).findElements(byTestAttributeId(testAttributeValue)).asScala.toList
    }
  }

  private def byTestAttributeId(testAttributeValue: String): org.openqa.selenium.By = {
    By.cssSelector(s"[$TestAttributeName=$testAttributeValue]")
  }

  private def wrapException[A](f: => A): A = {
    try {
      f
    } catch {
      case e: Exception =>
        throw new RuntimeException(s"WebElement was not found on page [$getClass]", e)
    }
  }
}