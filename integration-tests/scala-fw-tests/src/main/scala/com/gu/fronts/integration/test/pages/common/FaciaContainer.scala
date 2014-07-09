package com.gu.fronts.integration.test.page.common

import scala.collection.JavaConversions.asScalaBuffer

import org.openqa.selenium.{ WebDriver, WebElement }

import com.gu.fronts.integration.test.page.common.FaciaGalleryItem.{ GalleryItemContainerId, GalleryPictureId }
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object FaciaContainer {

  private val HeaderLinkId = "headerlink"

  private val ShowMoreExpandedId = "show-more-news-expanded"

  private val ShowMoreButtonId = "show-more"
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
    val galleryElements = findAllByTestAttribute(GalleryItemContainerId, rootElement)

    galleryElements find { galleryElement =>
      isPictureGallery(galleryElement)
    } map { galleryElement =>
      new FaciaGalleryItem(galleryElement)
    } getOrElse {
      throw new RuntimeException("Could not find any picture gallery elements")
    }
  }

  def isPictureGallery(galleryElement: WebElement): Boolean = {
    try {
      existsAndDisplayed(findByTestAttribute(GalleryPictureId, galleryElement))
      true
    } catch {
      case ex: Exception => {
        logger.debug("Element was not a picture gallery")
        false
      }
    }
  }
}