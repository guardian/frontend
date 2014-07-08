package com.gu.fronts.integration.test

import com.gu.automation.support.TestLogging
import com.gu.fronts.integration.test.config.PropertyLoader.{ BASE_URL, getProperty }
import com.gu.fronts.integration.test.pages.common.FrontsParentPage
import org.apache.commons.collections.CollectionUtils
import org.apache.commons.lang3.StringUtils
import org.openqa.selenium.{ By, WebDriver, WebDriverException, WebElement }
import scala.collection.JavaConverters._

trait PageHelper extends TestLogging {

  var driver: WebDriver;
  val frontsBaseUrl = getProperty(BASE_URL)
  val TEST_ATTR_NAME = "data-test-id"

  def goTo[Page <: FrontsParentPage](pageObject: Page): Page = {
    goTo(pageObject.url, pageObject)
  }

  def goTo[Page <: FrontsParentPage](url: String, pageObject: Page): Page = {
    driver.get(forceBetaSite(url))
    pageObject.isDisplayed
    pageObject
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
   * Will find the element with the provided test attribute id, using the webdriver as search context
   */
  def findByTestAttribute(testAttributeValue: String): WebElement = {
    driver.findElement(byTestAttributeId(testAttributeValue))
  }

  /**
   * Will find all elements with the provided test attribute id, using the webdriver as search context
   */
  def findAllByTestAttribute(testAttributeValue: String): List[WebElement] = {
    driver.findElements(byTestAttributeId(testAttributeValue)).asScala.toList
  }

  /**
   * Will find the element with the provided test attribute id, using the provided webelement as search context
   */
  def findByTestAttribute(testAttributeValue: String, contextElement: WebElement): WebElement = {
    contextElement.findElement(byTestAttributeId(testAttributeValue))
  }

  /**
   * Will find all elements with the provided test attribute id, using the provided webelement as search context
   */
  def findAllByTestAttribute(testAttributeValue: String, contextElement: WebElement): List[WebElement] = {
    contextElement.findElements(byTestAttributeId(testAttributeValue)).asScala.toList
  }

  private def byTestAttributeId(testAttributeValue: String): org.openqa.selenium.By = {
    By.cssSelector(new StringBuilder().append("[").append(TEST_ATTR_NAME).append("=").
      append(testAttributeValue).append("]").toString)
  }

  /**
   * Checks if the provided elements exist and are displayed. If any element is not, then an exception is
   * thrown with a message with further details about missing elements
   */
  def existsAndDisplayed(elementsToCheck: WebElement*): Boolean = {
    val errors = List[String]()
    for (webElement <- elementsToCheck) {
      checkElementExistsAndCreateError(webElement, errors)
    }
    if (!errors.isEmpty) {
      throw new RuntimeException("Error loading page due to: " + errors mkString ("\n"))
    } else {
      return true
    }
  }

  private def checkElementExistsAndCreateError(webElement: WebElement, errors: List[String]) {
    try {
      if (!webElement.isDisplayed) {
        errors :+ ("WebElement was not displayed " + webElement);
      }
    } catch {
      case e: WebDriverException => {
        logger.warn("WebElement was not displayed " + webElement, e)
        errors :+ (e.getMessage)
      }
    }
  }
}