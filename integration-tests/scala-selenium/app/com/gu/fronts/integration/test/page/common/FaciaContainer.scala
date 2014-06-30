package com.gu.fronts.integration.test.page.common

import scala.reflect.BeanProperty

import org.openqa.selenium.By.cssSelector
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.TEST_ATTR_NAME
import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute
import com.gu.fronts.integration.test.page.common.FaciaArticle.ARTICLE_CONTAINER_ID
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem.GALLERY_ITEM_CONTAINER_ID
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.elementClickable
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed
import com.gu.fronts.integration.test.page.util.PageElementHelper.waitUntilVisible
import com.gu.fronts.integration.test.page.common.FaciaContainer.HEADER_LINK_ID
import com.gu.fronts.integration.test.page.common.FaciaContainer.SHOW_MORE_BUTTON_ID
import com.gu.fronts.integration.test.page.common.FaciaContainer.SHOW_MORE_EXPANDED_ID

object FaciaContainer {

  private val HEADER_LINK_ID = "headerlink"

  private val SHOW_MORE_EXPANDED_ID = "show-more-news-expanded"

  private val SHOW_MORE_BUTTON_ID = "show-more"
}

class FaciaContainer(webDriver: WebDriver, containerTopElement: WebElement) extends FrontsParentPage(webDriver) {

  @BeanProperty
  var rootElement: WebElement = containerTopElement

  override def isDisplayed(): Boolean = {
    existsAndDisplayed(rootElement)
  }

  def clickHeader(): FaciaContainer = {
    val enclosingContainerId = getEnclosingContainerId
    val headerLink = rootElement.findElement(cssSelector(byTestAttribute(buildHeaderLinkTestAttributeValue(enclosingContainerId))))
    elementClickable(headerLink, webDriver)
    headerLink.click()
    pageFactory.initPage(webDriver, classOf[AllFaciaContainersPage]).containerWithId(enclosingContainerId)
  }

  private def buildHeaderLinkTestAttributeValue(enclosingContainerId: String): String = enclosingContainerId + HEADER_LINK_ID

  private def getEnclosingContainerId(): String = {
    existsAndDisplayed(rootElement)
    val rootElementTestAttributeValue = rootElement.getAttribute(TEST_ATTR_NAME)
    rootElementTestAttributeValue
  }

  def articleAt(index: Int): FaciaArticle = {
    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(ARTICLE_CONTAINER_ID)))
    pageFactory.initPage(webDriver, classOf[FaciaArticle], containerElements.get(index))
  }

  def expand(): WebElement = {
    rootElement.findElement(cssSelector(byTestAttribute(SHOW_MORE_BUTTON_ID))).click()
    val expandedElement = waitUntilVisible(rootElement.findElement(cssSelector(byTestAttribute(SHOW_MORE_EXPANDED_ID))), 2, webDriver)
    expandedElement
  }

  def galleryAt(index: Int): FaciaGalleryItem = {
    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(GALLERY_ITEM_CONTAINER_ID)))
    pageFactory.initPage(webDriver, classOf[FaciaGalleryItem], containerElements.get(index))
  }
}