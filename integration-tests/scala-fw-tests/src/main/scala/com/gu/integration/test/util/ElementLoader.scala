package com.gu.integration.test.util

import scala.collection.JavaConverters._
import org.openqa.selenium.WebElement
import org.openqa.selenium.SearchContext
import org.openqa.selenium.WebDriver
import org.openqa.selenium.By
import com.gu.integration.test.config.PropertyLoader._
import org.openqa.selenium.WebDriverException
import org.openqa.selenium.JavascriptExecutor

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
      case e: WebDriverException =>
        //Since this was converted from trait to class the getClass no longer gets the name of the calling class
        //TODO find a way to get the calling class
        throw new RuntimeException(s"WebElement(s) were not found on page [$getClass]", e)
    }
  }

  /**
   * Find all link elements, including nested, from the provided SearchContext and returns those that are displayed
   */
  def displayedLinks(searchContext: SearchContext): List[WebElement] = {
    wrapException {
      searchContext.findElements(By.cssSelector("a")).asScala.toList.filter(element => element.isDisplayed)
    }
  }

  /**
   * Find all image elements, including nested, from the provided SearchContext and returns those that are displayed.
   * Observe that this method does a double check as the selenium isDisplayed method does not guarantee that a picture is actually
   * visible
   */
  def displayedImages(searchContext: SearchContext)(implicit driver: WebDriver): List[WebElement] = {
    wrapException {
      val preDisplayedImages = searchContext.findElements(By.cssSelector("img")).asScala.toList.filter(element => element.isDisplayed)
      //preDisplayedImages
      return preDisplayedImages.filter(element => isImageDisplayed(element))
    }
  }

  def isImageDisplayed(imageElement: WebElement)(implicit driver: WebDriver): Boolean = {
    val result = driver.asInstanceOf[JavascriptExecutor].
      executeScript("return arguments[0].complete && typeof arguments[0].naturalWidth != \"undefined\" && arguments[0].naturalWidth > 0",
        imageElement)
    if (result.isInstanceOf[java.lang.Boolean]) {
      result.asInstanceOf[java.lang.Boolean]
    } else {
      false
    }
  }
}