package com.gu.fronts.integration.test.page.common

import com.gu.fronts.integration.test.page.util.PageElementHelper.getLinkFrom
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.util.AbstractParentPage
import com.gu.fronts.integration.test.page.util.CustomPageFactory
import FaciaArticle._

object FaciaArticle {

  val ARTICLE_CONTAINER_ID = "article-container"
}

class FaciaArticle(webDriver: WebDriver, containerTopElement: WebElement) extends AbstractParentPage(webDriver) {

  private var rootElement: WebElement = containerTopElement

  override def isDisplayed(): FaciaArticle = {
    assertExistsAndDisplayed(rootElement)
    this
  }

  def headlineLinkText(): String = getLinkFrom(rootElement).getText

  def clickHeadlineLink(): Article = {
    getLinkFrom(rootElement).click()
    pageFactory.initPage(webDriver, classOf[Article])
  }
}