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
}