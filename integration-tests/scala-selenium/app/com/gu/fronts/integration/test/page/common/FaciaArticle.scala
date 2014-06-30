package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed
import com.gu.fronts.integration.test.page.util.PageElementHelper.getLinkFrom

object FaciaArticle {

  val ARTICLE_CONTAINER_ID = "article-container"
}

class FaciaArticle(webDriver: WebDriver, containerTopElement: WebElement) extends FrontsParentPage(webDriver) {

  private var rootElement: WebElement = containerTopElement

  override def isDisplayed(): Boolean = {
    existsAndDisplayed(rootElement)
  }

  def headlineLinkText(): String = getLinkFrom(rootElement).getText

  def clickHeadlineLink(): Article = {
    getLinkFrom(rootElement).click()
    pageFactory.initPage(webDriver, classOf[Article])
  }
}