package com.gu.fronts.integration.test.page.common

import scala.collection.JavaConversions.asScalaBuffer

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.page.common.FaciaGalleryItem.{ GALLERY_ITEM_CONTAINER_ID, GALLERY_PICTURE_ID }
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object FaciaContainer {

  private val HEADER_LINK_ID = "headerlink"

  private val SHOW_MORE_EXPANDED_ID = "show-more-news-expanded"

  private val SHOW_MORE_BUTTON_ID = "show-more"
}

class FaciaContainer(rootElement: WebElement)(implicit var driver: WebDriver) extends FrontsParentPage {

  override def isDisplayed() = {
    existsAndDisplayed(rootElement)
  }

  private def clickFirstValidPictureOn() = {
    val picOverlay = firstPictureItem.clickPicture
    picOverlay.isDisplayed
    picOverlay
  }

  //  def clickHeader(): FaciaContainer = {
  //    val enclosingContainerId = getEnclosingContainerId
  //    val headerLink = rootElement.findElement(cssSelector(byTestAttribute(buildHeaderLinkTestAttributeValue(enclosingContainerId))))
  //    elementClickable(headerLink, webDriver)
  //    headerLink.click()
  //    pageFactory.initPage(webDriver, classOf[AllFaciaContainersPage]).containerWithId(enclosingContainerId)
  //  }
  //
  //  private def buildHeaderLinkTestAttributeValue(enclosingContainerId: String): String = enclosingContainerId + FaciaContainer.HEADER_LINK_ID
  //
  //  private def getEnclosingContainerId(): String = {
  //    existsAndDisplayed(rootElement)
  //    val rootElementTestAttributeValue = rootElement.getAttribute(TEST_ATTR_NAME)
  //    rootElementTestAttributeValue
  //  }
  //
  //  def articleAt(index: Int): FaciaArticle = {
  //    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(ARTICLE_CONTAINER_ID)))
  //    pageFactory.initPage(webDriver, classOf[FaciaArticle], containerElements.get(index))
  //  }
  //
  //  def expand(): WebElement = {
  //    rootElement.findElement(cssSelector(byTestAttribute(FaciaContainer.SHOW_MORE_BUTTON_ID))).click()
  //    val expandedElement = waitUntilVisible(rootElement.findElement(cssSelector(byTestAttribute(FaciaContainer.SHOW_MORE_EXPANDED_ID))), 2, webDriver)
  //    expandedElement
  //  }
  //
  def firstPictureItem(): FaciaGalleryItem = {
    val galleryElements = findAllByTestAttribute(GALLERY_ITEM_CONTAINER_ID, rootElement)

    for (galleryElement <- galleryElements) yield {
      if (isPictureGallery(galleryElement)) {
        return new FaciaGalleryItem(galleryElement)
      }
    }
    throw new RuntimeException("Could not find any picture gallery elements")
  }

  def isPictureGallery(galleryElement: WebElement): Boolean = {
    try {
      existsAndDisplayed(findByTestAttribute(GALLERY_PICTURE_ID, galleryElement))
      true
    } catch {
      case ex: Exception => {
        logger.debug("Element was not a picture gallery")
        false
      }
    }
  }
  //
  //  def galleryAt(index: Int): FaciaGalleryItem = {
  //    val containerElements = rootElement.findElements(cssSelector(byTestAttribute(GALLERY_ITEM_CONTAINER_ID)))
  //    pageFactory.initPage(webDriver, classOf[FaciaGalleryItem], containerElements.get(index))
  //  }
  //
}