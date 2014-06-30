package com.gu.fronts.integration.test.page.common

import scala.collection.JavaConversions.asScalaBuffer
import scala.reflect.BeanProperty

import org.openqa.selenium.{WebDriver, WebElement}
import org.openqa.selenium.By.cssSelector

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.{TEST_ATTR_NAME, byTestAttribute}
import com.gu.fronts.integration.test.page.common.FaciaArticle.ARTICLE_CONTAINER_ID
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem.{GALLERY_ITEM_CONTAINER_ID, GALLERY_PICTURE_ID}
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.{elementClickable, existsAndDisplayed, waitUntilVisible}

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

  private def buildHeaderLinkTestAttributeValue(enclosingContainerId: String): String = enclosingContainerId + FaciaContainer.HEADER_LINK_ID

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
    rootElement.findElement(cssSelector(byTestAttribute(FaciaContainer.SHOW_MORE_BUTTON_ID))).click()
    val expandedElement = waitUntilVisible(rootElement.findElement(cssSelector(byTestAttribute(FaciaContainer.SHOW_MORE_EXPANDED_ID))), 2, webDriver)
    expandedElement
  }

  def firstGalleryItem(): FaciaGalleryItem = {
    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(GALLERY_ITEM_CONTAINER_ID)))
    for (element <- containerElements) yield {
      if (isPictureGallery(element)) {
        return pageFactory.initPage(webDriver, classOf[FaciaGalleryItem], element)
      }
    }
    throw new RuntimeException("Could not find any picture gallery elements on page: " + classOf[AllFaciaContainersPage].getSimpleName())
  }

  def galleryAt(index: Int): FaciaGalleryItem = {
    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(GALLERY_ITEM_CONTAINER_ID)))
    pageFactory.initPage(webDriver, classOf[FaciaGalleryItem], containerElements.get(index))
  }

  private def isPictureGallery(element: org.openqa.selenium.WebElement): Boolean = {
    existsAndDisplayed(element, GALLERY_PICTURE_ID)
  }
}