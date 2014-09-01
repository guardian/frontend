package com.gu.integration.test.util

import com.gu.automation.support.TestLogging
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.support.ui.{ExpectedCondition, WebDriverWait}
import org.openqa.selenium.{By, JavascriptExecutor, SearchContext, WebDriver, WebDriverException, WebElement}

import scala.collection.JavaConverters.asScalaBufferConverter

object ElementLoader extends TestLogging {

  val TestAttributeName = "data-test-id"

  def notDisplayed(elementsToCheck: List[WebElement]): List[WebElement] = {
    elementsToCheck.filter(element => !element.isDisplayed())
  }

  def displayed(elementsToCheck: List[WebElement]): List[WebElement] = {
    elementsToCheck.filter(element => element.isDisplayed())
  }

  /**
   * Will find the element with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver, which has to be in scope.
   */
  def findByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver: WebDriver): WebElement = {
    contextElement.getOrElse(driver).findElement(byTestAttributeId(testAttributeValue))
  }

  /**
   * Will find all elements with the provided test attribute id and, if provided, using the provided webelement as search context
   * otherwise it will use the WebDriver, which has to be in scope
   */
  def findAllByTestAttribute(testAttributeValue: String, contextElement: Option[SearchContext] = None)(implicit driver: WebDriver): List[WebElement] = {
    contextElement.getOrElse(driver).findElements(byTestAttributeId(testAttributeValue)).asScala.toList
  }

  private def byTestAttributeId(testAttributeValue: String): org.openqa.selenium.By = {
    By.cssSelector(s"[$TestAttributeName=$testAttributeValue]")
  }

  /**
   * Find maxElements of displayed and visible link elements, including nested, from the provided SearchContext
   */
  def displayedLinks(searchContext: SearchContext, maxElements: Int = Int.MaxValue)(implicit driver: WebDriver): List[WebElement] = {
    //this is needed because sometimes it takes a while for AJAX to load the links so a race condition may occur
    //with the subsequent findElements
    waitUntil(visibilityOfElementLocated(By.cssSelector("a")), 5)

    displayedElements(searchContext.findElements(By.cssSelector("a")).asScala.toList, 3, maxElements)
  }

  /**
   * Find maxElements of displayed and visible elements, including nested, from the provided SearchContext
   */
  def displayedElements(elements: List[WebElement], timeoutInSeconds: Int = 3, maxElements: Int = Int.MaxValue)(implicit driver: WebDriver): List[WebElement] = {
    elements.view
      .filter(element => waitUntil(visibilityOf(element), timeoutInSeconds) && element.isDisplayed())
      .take(maxElements)
      .toList
  }

  /**
   * Finds one displayed link, including nested, from the provided SearchContext or, if none is provided, the driver
   */
  def displayedLink(searchContext: SearchContext)(implicit driver: WebDriver): WebElement = {
    val link = searchContext.findElement(By.cssSelector("a"))
    waitUntil(elementToBeClickable(link))
    link
  }

  /**
   * Find all image elements, including nested, from the provided SearchContext and returns those that are displayed.
   * Observe that this method does a double check as the selenium check for visibility does not guarantee that an image is
   * actually displayed, just that an img element is not hidden
   */
  def displayedImages(searchContext: SearchContext)(implicit driver: WebDriver): List[WebElement] = {
    //this is needed because sometimes it takes a while for AJAX to load the images so a race condition may occur
    //with the subsequent findElements
    waitUntil(visibilityOfElementLocated(By.cssSelector("img")), 5)

    val imageElements = searchContext.findElements(By.cssSelector("img"))
    logger.info(s"Found ${imageElements.size()} image elements")

    val preDisplayedImages = imageElements.asScala.toList.filter(element => waitUntil(visibilityOf(element)))
    preDisplayedImages.filter(element => isImageDisplayed(element))
  }

  /**
   * Use this method to check that an img element is properly displayed. This is needed as the Selenium check for visibility does not explicitly
   * guarantee that the image is displayed, just that the element is there and visible. This actually checks the size of the image to
   * make sure it is greater than 0
   */
  def isImageDisplayed(imageElement: WebElement)(implicit driver: WebDriver): Boolean = {
    val result = driver.asInstanceOf[JavascriptExecutor].
      executeScript("return arguments[0].complete && typeof arguments[0].naturalWidth != \"undefined\" && arguments[0].naturalWidth > 0",
        imageElement)
    logger.info(s"isImageDisplayed result: ${result}")
    if (result.isInstanceOf[java.lang.Boolean]) {
      result.asInstanceOf[java.lang.Boolean]
    } else {
      false
    }
  }

  /**
   * Find all link IFrames, including nested, from the provided SearchContext and returns those that are visible
   */
  def displayedIFrames(searchContext: SearchContext)(implicit driver: WebDriver): List[WebElement] = {
    searchContext.findElements(By.cssSelector("iframe")).asScala.toList.filter(
      element => waitUntil(visibilityOf(element)) && element.isDisplayed())
  }

  def firstDisplayedIframe(rootElement: WebElement)(implicit driver: WebDriver): WebElement = {
    val iframeElements = displayedIFrames(rootElement)
    if (iframeElements.size != 1) {
      throw new RuntimeException(s"Unexpected number of iframes ${iframeElements.size} inside element: ${rootElement}")
    }
    iframeElements.last
  }

  /**
   * Utility method which uses a WebDriverWait and the provided expected condition and then returns a Boolean based on
   * the WebDriverWait(...).until outcome.
   */
  def waitUntil[T](expectedCondition: ExpectedCondition[T], timeoutInSeconds: Int = 3)(implicit driver: WebDriver): Boolean = {
    try {
      new WebDriverWait(driver, timeoutInSeconds).until(expectedCondition)
    } catch {
      case e: WebDriverException => {
        logger.info(s"Element not displayed after waiting: ${e.getMessage()}")
        false
      }
    }
    true
  }

  /**
   * Utility method which uses a WebDriverWait and the provided expected condition and then returns the generic object instance
   * based on the WebDriverWait(...).until outcome.
   */
  def waitUntilObject[T](expectedCondition: ExpectedCondition[T], timeoutInSeconds: Int = 3)(implicit driver: WebDriver): T = {
    new WebDriverWait(driver, timeoutInSeconds).until(expectedCondition)
  }
}