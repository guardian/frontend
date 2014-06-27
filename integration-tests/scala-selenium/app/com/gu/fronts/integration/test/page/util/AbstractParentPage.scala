package com.gu.fronts.integration.test.page.util

import org.apache.commons.collections.CollectionUtils.isNotEmpty
import java.util.ArrayList
import java.util.List
import org.apache.commons.lang3.StringUtils
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebDriverException
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.common.FooterPage
import com.gu.fronts.integration.test.page.common.HeaderPage
import AbstractParentPage._
//remove if not needed
import scala.collection.JavaConversions._

object AbstractParentPage {

  private var LOG: Log = LogFactory.getLog(classOf[AbstractParentPage])
}

abstract class AbstractParentPage(protected var webDriver: WebDriver) {

  protected var pageFactory: CustomPageFactory = new CustomPageFactory()

  protected def loadPage[Page](pageClass: Class[Page]): Page = {
    pageFactory.initPage(webDriver, pageClass)
  }

  def header(): HeaderPage = {
    if (this.isInstanceOf[HeaderPage]) {
      throw new RuntimeException("Cannot get header from HeaderPage as it is the header")
    }
    pageFactory.initPage(webDriver, classOf[HeaderPage])
  }

  def footer(): FooterPage = {
    if (this.isInstanceOf[FooterPage]) {
      throw new RuntimeException("Cannot get footer from FooterPage as it is the footer")
    }
    pageFactory.initPage(webDriver, classOf[FooterPage])
  }

  protected def assertExistsAndDisplayed(elementsToCheck: WebElement*) {
    val errors = new ArrayList[String]()
    for (webElement <- elementsToCheck) {
      checkElementExistsAndCreateError(webElement, errors)
    }
    if (isNotEmpty(errors)) {
      throw new AssertionError("Page :" + this.getClass.getName + " was not displayed properly due to: " + getErrorMessages(errors))
    }
  }

  def isDisplayed(): AnyRef

  private def getErrorMessages(errors: List[String]): String = StringUtils.join(errors, ",")

  private def checkElementExistsAndCreateError(webElement: WebElement, errors: List[String]) {
    try {
      webElement.isDisplayed
    } catch {
      case e: WebDriverException => {
        LOG.debug(e)
        errors.add(e.getMessage)
      }
    }
  }
}