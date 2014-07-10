package com.gu.fronts.integration.test

import scala.collection.JavaConverters.asScalaBufferConverter
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebDriverException
import org.openqa.selenium.WebElement
import com.gu.automation.support.TestLogging
import com.gu.fronts.integration.test.config.PropertyLoader._
import com.gu.fronts.integration.test.pages.common.FrontsParentPage
import org.openqa.selenium.SearchContext

/**
 * This trait is providing various helper functionalities for navigating, loading and initialising pages and Page Objects.
 * Observe that it depends on a WebDriver to be in context to work
 */
trait PageHelper extends TestLogging {

  val frontsBaseUrl = getProperty(BaseUrl)
  val TestAttributeName = "data-test-id"

  def goTo[Page <: FrontsParentPage](absoluteUrl: String, pageObject: => Page)(implicit driver:WebDriver): Page = {
    driver.get(forceBetaSite(absoluteUrl))
    pageObject
  }

  def fromRelativeUrl(relativeUrl: String): String = {
    frontsBaseUrl + relativeUrl
  }

  /**
   * This will append the request parameters needed to switch to beta site. However, for some reason, this does not work on
   * localhost so had to make a check
   */
  def forceBetaSite(url: String): String = {
    if (frontsBaseUrl.startsWith("http://localhost")) {
      url
    } else {
      frontsBaseUrl + "/preference/platform/mobile?page=" + url + "&view=mobile"
    }
  }

  /**
   * Will find the element with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver
   */
  def findByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver:WebDriver): WebElement = {
    wrapException {
      contextElement.getOrElse(driver).findElement(byTestAttributeId(testAttributeValue))
    }
  }

  /**
   * Will find all elements with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver
   */
  def findAllByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver:WebDriver): List[WebElement] = {
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