package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.util.AbstractParentPage

class Article(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  @FindByTestAttribute(using = "article")
  private var rootElement: WebElement = _

  @FindByTestAttribute(using = "article-headline")
  private var headline: WebElement = _

  override def isDisplayed(): Article = {
    assertExistsAndDisplayed(rootElement, headline)
    this
  }

  def headlineText(): String = headline.getText
}