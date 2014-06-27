package com.gu.fronts.integration.test.page.util

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute
import com.gu.fronts.integration.test.page.util.PageElementHelper.findElementBy
import org.openqa.selenium.By.cssSelector
import java.lang.reflect.Constructor
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.PageFactory
import org.openqa.selenium.support.pagefactory.ElementLocatorFactory
import com.gu.fronts.integration.test.fw.selenium.CustomElementLocatorFactory
import com.gu.fronts.integration.test.fw.selenium.CustomFieldDecorator
import CustomPageFactory._
//remove if not needed
import scala.collection.JavaConversions._

object CustomPageFactory {

  private def instantiatePage[T](driver: WebDriver, pageClassToProxy: Class[T]): T = {
    try {
      val constructor = pageClassToProxy.getConstructor(classOf[WebDriver])
      constructor.newInstance(driver)
    } catch {
      case e: NoSuchMethodException => pageClassToProxy.newInstance()
    }
  }

  private def instantiatePage[T](driver: WebDriver, pageClassToProxy: Class[T], rootElement: WebElement): T = {
    val constructor = pageClassToProxy.getConstructor(classOf[WebDriver], classOf[WebElement])
    constructor.newInstance(driver, rootElement)
  }
}

class CustomPageFactory {

  def initPage[Page](webDriver: WebDriver, pageClass: Class[Page]): Page = {
    val page = instantiatePage(webDriver, pageClass)
    PageFactory.initElements(new CustomFieldDecorator(new CustomElementLocatorFactory(webDriver)), page)
    page
  }

  def initPage[Page](webDriver: WebDriver, pageClass: Class[Page], parentElement: WebElement, testAttributeId: String): Page = {
    val page = instantiatePage(webDriver, pageClass, findElementBy(parentElement, cssSelector(byTestAttribute(testAttributeId))))
    page
  }

  def initPage[Page](webDriver: WebDriver, pageClass: Class[Page], rootElement: WebElement): Page = {
    instantiatePage(webDriver, pageClass, rootElement)
  }
}