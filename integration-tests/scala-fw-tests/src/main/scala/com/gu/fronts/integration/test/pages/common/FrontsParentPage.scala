package com.gu.fronts.integration.test.pages.common

import java.util.{ArrayList, List}

import com.gu.automation.support.TestLogging
import org.apache.commons.collections.CollectionUtils
import org.apache.commons.lang3.StringUtils
import org.openqa.selenium.{By, WebDriver, WebDriverException, WebElement}

abstract class FrontsParentPage(webDriver: WebDriver) extends TestLogging {
  
  val TEST_ATTR_NAME = "data-test-id"
    
    
  def isDisplayed(): Boolean
  def url:String

  def findByTestAttribute(testAttributeValue: String): WebElement = {
    webDriver.findElement(By.cssSelector(new StringBuilder().append("[").append(TEST_ATTR_NAME).append("=").
      append(testAttributeValue).append("]").toString))
  }

  def existsAndDisplayed(elementsToCheck: WebElement*): Boolean = {
    val errors = new ArrayList[String]()
    for (webElement <- elementsToCheck) {
      checkElementExistsAndCreateError(webElement, errors)
    }
    if (CollectionUtils.isNotEmpty(errors)) {
      logger.info(getErrorMessages(errors))
      false
    } else {
      true
    }
  }

  private def checkElementExistsAndCreateError(webElement: WebElement, errors: List[String]) {
    try {
      webElement.isDisplayed
    } catch {
      case e: WebDriverException => errors.add(e.getMessage)
    }
  }

  private def getErrorMessages(errors: List[String]): String = StringUtils.join(errors, ",")

}